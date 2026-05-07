package repository

import "github.com/mxilia/CEE-Final/internal/entities"

type SongRepository interface {
	Save(song *entities.Song) error
	FindAll(offset int, limit int) ([]*entities.Song, error)
	FindByID(id uint) (*entities.Song, error)
	Count() (int64, error)
	Patch(id uint, song *entities.Song) error
	Delete(id uint) error
}
