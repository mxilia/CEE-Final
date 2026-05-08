package entities

import (
	"time"

	"gorm.io/datatypes"
)

type SongData struct {
	SongID         uint           `gorm:"not null" json:"song_id"`
	FrequencyArray datatypes.JSON `gorm:"type:jsonb;not null" json:"frequency_array"`
	AudioBucket    string         `gorm:"type:varchar(255);not null;default:''" json:"audio_bucket"`
	AudioPath      string         `gorm:"type:text;not null;default:''" json:"audio_path"`
	AudioPublicURL string         `gorm:"type:text;not null;default:''" json:"audio_public_url"`
	Lyrics         datatypes.JSON `gorm:"type:jsonb;not null" json:"lyrics"`
	CreatedAt      time.Time      `gorm:"timestamptz(3)" json:"created_at"`
}
