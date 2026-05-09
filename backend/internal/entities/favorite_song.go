package entities

import "github.com/google/uuid"

type FavoriteSong struct {
	ID     uint      `gorm:"primaryKey" json:"id"`
	UserID uuid.UUID `gorm:"not null" json:"user_id"`
	SongID uint      `gorm:"not null" json:"song_id"`
	Song   Song      `gorm:"foreignKey:SongID" json:"song"`
}
