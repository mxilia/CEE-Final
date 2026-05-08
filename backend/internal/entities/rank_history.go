package entities

type RankHistory struct {
	ID     uint `gorm:"primaryKey" json:"id"`
	UserID uint `gorm:"not null" json:"user_id"`
	SongID uint `gorm:"not null" json:"song_id"`
	Rank   int  `gorm:"not null" json:"rank"`
}
