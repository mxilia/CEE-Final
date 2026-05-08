package rest

import (
	"errors"
	"math"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/mxilia/CEE-Final/internal/entities"
	"github.com/mxilia/CEE-Final/internal/song/usecase"
	appError "github.com/mxilia/CEE-Final/pkg/apperror"
	"github.com/mxilia/CEE-Final/pkg/responses"
	"gorm.io/gorm"
)

type HttpSongHandler struct {
	db              *gorm.DB
	songUseCase     usecase.SongUseCase
	songDataUseCase usecase.SongDataUseCase
}

func NewHttpSongHandler(db *gorm.DB, songUseCase usecase.SongUseCase, songDataUseCase usecase.SongDataUseCase) *HttpSongHandler {
	return &HttpSongHandler{
		db:              db,
		songUseCase:     songUseCase,
		songDataUseCase: songDataUseCase,
	}
}

func parseUintParam(c *fiber.Ctx, key string) (uint, error) {
	value := c.Params(key)
	id, err := strconv.ParseUint(value, 10, 32)
	if err != nil {
		return 0, appError.ErrInvalidData
	}
	return uint(id), nil
}

func (h *HttpSongHandler) FindAllSongs(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)

	songs, totalSongs, err := h.songUseCase.FindAllSongs(page, limit)
	if err != nil {
		return responses.Error(c, err)
	}

	return c.JSON(fiber.Map{
		"data": songs,
		"meta": fiber.Map{
			"page":       page,
			"total":      totalSongs,
			"totalPages": int(math.Ceil(float64(totalSongs) / float64(limit))),
		},
	})
}

func (h *HttpSongHandler) FindSongByID(c *fiber.Ctx) error {
	songID, err := parseUintParam(c, "id")
	if err != nil {
		return responses.Error(c, err)
	}

	song, err := h.songUseCase.FindSongByID(songID)
	if err != nil {
		return responses.Error(c, err)
	}
	return c.JSON(song)
}

func (h *HttpSongHandler) FindSongDataBySongID(c *fiber.Ctx) error {
	songID, err := parseUintParam(c, "song_id")
	if err != nil {
		return responses.Error(c, err)
	}

	songData, err := h.songDataUseCase.FindSongDataBySongID(songID)
	if err != nil {
		// If song-data isn't ready yet, return a 202 with job status.
		if errors.Is(err, gorm.ErrRecordNotFound) || errors.Is(err, appError.ErrRecordNotFound) {
			var job entities.KaraokeJob
			jerr := h.db.Order("updated_at desc").First(&job, "song_id = ?", songID).Error
			if jerr == nil {
				return c.Status(fiber.StatusAccepted).JSON(fiber.Map{
					"song_id": songID,
					"status":  job.Status,
					"job_id":  job.JobID,
					"error":   job.Error,
				})
			}
			// Fall back to default 404 behavior if we don't have a job either.
		}
		return responses.Error(c, err)
	}
	return c.JSON(songData)
}
