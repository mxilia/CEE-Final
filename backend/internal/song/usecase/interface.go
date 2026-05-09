package usecase

import "github.com/mxilia/CEE-Final/internal/entities"

type SongUseCase interface {
	CreateSong(song *entities.Song) error
	FindAllSongs(title string, page int, limit int) ([]*entities.Song, int64, error)
	FindSongByID(id uint) (*entities.Song, error)
	PatchSong(id uint, song *entities.Song) error
	DeleteSong(id uint) error
}
