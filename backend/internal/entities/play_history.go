package entities

import (
	"time"

	"github.com/google/uuid"
)

type PlayHistory struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	UserID        uuid.UUID `gorm:"not null" json:"user_id"`
	SongID        uint      `gorm:"not null" json:"song_id"`
	Song          Song      `gorm:"foreignKey:SongID" json:"song"`
	TotalScore    int       `gorm:"not null" json:"total_score"`
	MaxCombo      int       `gorm:"not null" json:"max_combo"`
	Accuracy      float64   `gorm:"not null" json:"accuracy"`
	MinutesPlayed float64   `gorm:"default:0" json:"minutes_played"`
	CreatedAt     time.Time `gorm:"timestamptz(3)" json:"created_at"`
}
