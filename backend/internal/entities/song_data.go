package entities

import "time"

type SongData struct {
	SongID    uint      `gorm:"not null" json:"song_id"`
	CreatedAt time.Time `gorm:"timestamptz(3)" json:"created_at"`
}
