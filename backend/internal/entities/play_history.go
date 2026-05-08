package entities

import "time"

type PlayHistory struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"not null" json:"user_id"`
	SongID     uint      `gorm:"not null" json:"song_id"`
	TotalScore int       `gorm:"not null" json:"total_score"`
	CreatedAt  time.Time `gorm:"timestamptz(3)" json:"created_at"`
}
