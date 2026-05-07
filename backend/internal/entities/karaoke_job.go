package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type KaraokeJob struct {
	JobID          string         `gorm:"primaryKey;type:varchar(64)" json:"job_id"`
	UserID         uuid.UUID      `gorm:"type:uuid;index" json:"user_id"`
	SongID         uint           `gorm:"index" json:"song_id"`
	Title          string         `gorm:"type:varchar(255);not null;default:''" json:"title"`
	Artist         string         `gorm:"type:varchar(255);not null;default:''" json:"artist"`
	YoutubeURL     string         `gorm:"type:text;not null" json:"youtube_url"`
	AudioBucket    string         `gorm:"type:varchar(255);not null" json:"audio_bucket"`
	AudioPath      string         `gorm:"type:text;not null" json:"audio_path"`
	AudioPublicURL string         `gorm:"type:text" json:"audio_public_url"`
	YinConfig      datatypes.JSON `gorm:"type:jsonb;not null" json:"yin"`
	FrequenciesHz  []float64      `gorm:"type:jsonb;not null" json:"frequencies_hz"`
	Status         string         `gorm:"type:varchar(32);not null" json:"status"`
	Error          string         `gorm:"type:text" json:"error"`
	CreatedAt      time.Time      `gorm:"timestamptz(3)" json:"created_at"`
	UpdatedAt      time.Time      `gorm:"timestamptz(3)" json:"updated_at"`
}

