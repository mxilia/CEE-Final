package usecase

import "github.com/mxilia/CEE-Final/internal/entities"

type SongUseCase interface {
	CreateSong(song *entities.Song) error
	FindAllSongs(page int, limit int) ([]*entities.Song, int64, error)
	FindSongByID(id uint) (*entities.Song, error)
	PatchSong(id uint, song *entities.Song) error
	DeleteSong(id uint) error
}

type SongDataUseCase interface {
	CreateSongData(songData *entities.SongData) error
	FindSongDataBySongID(songID uint) (*entities.SongData, error)
	PatchSongData(songID uint, songData *entities.SongData) error
	DeleteSongData(songID uint) error
}
