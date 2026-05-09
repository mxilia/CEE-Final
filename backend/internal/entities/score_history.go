package entities

import (
	"time"

	"github.com/google/uuid"
)

type RankHistory struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uuid.UUID `gorm:"not null" json:"user_id"`
	SongID    uint      `gorm:"not null" json:"song_id"`
	Rank      int       `gorm:"not null" json:"rank"`
	CreatedAt time.Time `gorm:"timestamptz(3)" json:"created_at"`
}
