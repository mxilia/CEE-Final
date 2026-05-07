package entities

type FavoriteSong struct {
	ID     uint `gorm:"primaryKey" json:"id"`
	UserID uint `gorm:"not null" json:"user_id"`
	SongID uint `gorm:"not null" json:"song_id"`
}
