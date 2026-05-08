package entities

import "time"

type Song struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"user_id"`
	YoutubeURL string   `gorm:"type:text;not null;default:''" json:"youtube_url"`
	JobID     string    `gorm:"type:varchar(64);index" json:"job_id"`
	Title     string    `gorm:"type:varchar(255);not null" json:"title"`
	Artist    string    `gorm:"type:varchar(255);not null" json:"artist"`
	CreatedAt time.Time `gorm:"timestamptz(3)" json:"created_at"`
}
