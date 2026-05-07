package rest

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mxilia/CEE-Final/internal/entities"
	"github.com/mxilia/CEE-Final/pkg/config"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type HttpKaraokeJobHandler struct {
	db  *gorm.DB
	cfg *config.Config
}

func NewHttpKaraokeJobHandler(db *gorm.DB, cfg *config.Config) *HttpKaraokeJobHandler {
	return &HttpKaraokeJobHandler{db: db, cfg: cfg}
}

type callbackAudio struct {
	Bucket    string `json:"bucket"`
	Path      string `json:"path"`
	PublicURL string `json:"public_url"`
}

type callbackPayload struct {
	JobID      string                 `json:"job_id"`
	YoutubeURL string                 `json:"youtube_url"`
	Audio      callbackAudio          `json:"audio"`
	Yin        map[string]interface{} `json:"yin"`
	FreqsHz    []float64              `json:"frequencies_hz"`
}

type createJobRequest struct {
	YoutubeURL string                 `json:"youtube_url"`
	Title      string                 `json:"title"`
	Artist     string                 `json:"artist"`
	Yin        map[string]interface{} `json:"yin"`
}

type createJobResponse struct {
	JobID  string `json:"job_id"`
	SongID uint   `json:"song_id"`
}

type pythonGenerateRequest struct {
	JobID             string                 `json:"job_id"`
	YoutubeURL        string                 `json:"youtube_url"`
	CallbackURL       string                 `json:"callback_url"`
	SupabasePathPrefx string                 `json:"supabase_path_prefix"`
	Yin               map[string]interface{} `json:"yin,omitempty"`
}

func (h *HttpKaraokeJobHandler) verifySignature(c *fiber.Ctx) error {
	secret := h.cfg.KaraokeCallbackHmacSecret
	if secret == "" {
		return nil
	}

	ts := c.Get("X-Karaoke-Timestamp")
	sig := c.Get("X-Karaoke-Signature")
	if ts == "" || sig == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "missing karaoke signature headers")
	}

	// Basic replay protection: 5 minute skew window.
	tsInt, err := strconv.ParseInt(ts, 10, 64)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid karaoke timestamp")
	}
	now := time.Now().Unix()
	if tsInt < now-300 || tsInt > now+300 {
		return fiber.NewError(fiber.StatusUnauthorized, "karaoke timestamp out of range")
	}

	body := c.Body()
	msg := append([]byte(ts+"."), body...)
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write(msg)
	expected := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(expected), []byte(sig)) {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid karaoke signature")
	}
	return nil
}

func (h *HttpKaraokeJobHandler) UpsertFromCallback(c *fiber.Ctx) error {
	if err := h.verifySignature(c); err != nil {
		return err
	}

	var payload callbackPayload
	if err := c.BodyParser(&payload); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid json body")
	}
	if payload.JobID == "" || payload.YoutubeURL == "" || payload.Audio.Bucket == "" || payload.Audio.Path == "" {
		return fiber.NewError(fiber.StatusBadRequest, "missing required fields")
	}

	yinBytes, err := json.Marshal(payload.Yin)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid yin config")
	}

	// Update existing job created by CreateJob (keeps SongID/UserID/metadata).
	var job entities.KaraokeJob
	if err := h.db.First(&job, "job_id = ?", payload.JobID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fiber.NewError(fiber.StatusNotFound, "job not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	job.YoutubeURL = payload.YoutubeURL
	job.AudioBucket = payload.Audio.Bucket
	job.AudioPath = payload.Audio.Path
	job.AudioPublicURL = payload.Audio.PublicURL
	job.YinConfig = datatypes.JSON(yinBytes)
	job.FrequenciesHz = payload.FreqsHz
	job.Status = "succeeded"
	job.Error = ""

	if err := h.db.Save(&job).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Upsert SongData so frontend can load audio+frequencies by song_id.
	lyricsEmpty := datatypes.JSON([]byte(`[]`))
	var existing entities.SongData
	err = h.db.First(&existing, "song_id = ?", job.SongID).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	if err == gorm.ErrRecordNotFound {
		sd := entities.SongData{
			SongID:         job.SongID,
			FrequencyArray: payload.FreqsHz,
			AudioBucket:    payload.Audio.Bucket,
			AudioPath:      payload.Audio.Path,
			AudioPublicURL: payload.Audio.PublicURL,
			Lyrics:         lyricsEmpty,
		}
		if err := h.db.Create(&sd).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}
	} else {
		if err := h.db.Model(&entities.SongData{}).Where("song_id = ?", job.SongID).Updates(map[string]interface{}{
			"frequency_array":  payload.FreqsHz,
			"audio_bucket":     payload.Audio.Bucket,
			"audio_path":       payload.Audio.Path,
			"audio_public_url": payload.Audio.PublicURL,
		}).Error; err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}
	}

	return c.JSON(fiber.Map{"ok": true, "job_id": payload.JobID})
}

func (h *HttpKaraokeJobHandler) GetJob(c *fiber.Ctx) error {
	jobID := c.Params("job_id")
	if jobID == "" {
		return fiber.NewError(fiber.StatusBadRequest, "missing job_id")
	}

	var job entities.KaraokeJob
	if err := h.db.First(&job, "job_id = ?", jobID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fiber.NewError(fiber.StatusNotFound, "job not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(job)
}

func (h *HttpKaraokeJobHandler) CreateJob(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return fiber.NewError(fiber.StatusUnauthorized, "unauthorized")
	}

	var req createJobRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid json body")
	}
	if req.YoutubeURL == "" || req.Title == "" || req.Artist == "" {
		return fiber.NewError(fiber.StatusBadRequest, "youtube_url, title, artist are required")
	}

	jobID := uuid.NewString()
	emptyJSON := datatypes.JSON([]byte(`{}`))

	// Create a Song row so the frontend can browse songs by song struct
	// and later load song-data/audio by song_id. (Song.UserID is uint; auth user_id is UUID.)
	song := entities.Song{
		UserID:     0,
		YoutubeURL: req.YoutubeURL,
		JobID:      jobID,
		Title:      req.Title,
		Artist:     req.Artist,
	}
	if err := h.db.Create(&song).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	job := entities.KaraokeJob{
		JobID:          jobID,
		UserID:         userID,
		SongID:         song.ID,
		Title:          req.Title,
		Artist:         req.Artist,
		YoutubeURL:     req.YoutubeURL,
		AudioBucket:    "",
		AudioPath:      "",
		AudioPublicURL: "",
		YinConfig:      emptyJSON,
		FrequenciesHz:  []float64{},
		Status:         "queued",
		Error:          "",
	}

	if err := h.db.Create(&job).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	callbackURL := h.cfg.BackendBaseURL + "/api/v1/karaoke/jobs/callback"
	genReq := pythonGenerateRequest{
		JobID:             jobID,
		YoutubeURL:        req.YoutubeURL,
		CallbackURL:       callbackURL,
		SupabasePathPrefx: "jobs/",
		Yin:               req.Yin,
	}
	bodyBytes, err := json.Marshal(genReq)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to encode generator request")
	}

	httpReq, err := http.NewRequest(http.MethodPost, h.cfg.KaraokeGeneratorURL+"/generate", bytes.NewReader(bodyBytes))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create generator request")
	}
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		_ = h.db.Model(&entities.KaraokeJob{}).Where("job_id = ?", jobID).Updates(map[string]interface{}{
			"status": "failed",
			"error":  err.Error(),
		}).Error
		return fiber.NewError(fiber.StatusBadGateway, "failed to call karaoke generator")
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		_ = h.db.Model(&entities.KaraokeJob{}).Where("job_id = ?", jobID).Updates(map[string]interface{}{
			"status": "failed",
			"error":  "generator returned non-2xx",
		}).Error
		return fiber.NewError(fiber.StatusBadGateway, "karaoke generator returned non-2xx")
	}

	return c.Status(fiber.StatusCreated).JSON(createJobResponse{JobID: jobID, SongID: song.ID})
}
