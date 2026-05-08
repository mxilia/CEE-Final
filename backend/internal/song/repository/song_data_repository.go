package repository

import "github.com/mxilia/CEE-Final/internal/entities"

type SongDataRepository interface {
	Save(songData *entities.SongData) error
	FindBySongID(songID uint) (*entities.SongData, error)
	Patch(songID uint, songData *entities.SongData) error
	Delete(songID uint) error
}
