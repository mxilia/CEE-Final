package usecase

import (
	"github.com/mxilia/CEE-Final/internal/entities"
	"github.com/mxilia/CEE-Final/internal/song/repository"
	appError "github.com/mxilia/CEE-Final/pkg/apperror"
)

type SongService struct {
	songRepo repository.SongRepository
}

func NewSongService(songRepo repository.SongRepository) SongUseCase {
	return &SongService{songRepo: songRepo}
}

func (s *SongService) CreateSong(song *entities.Song) error {
	if song.Title == "" || song.Artist == "" {
		return appError.ErrInvalidData
	}
	return s.songRepo.Save(song)
}

func (s *SongService) FindAllSongs(page int, limit int) ([]*entities.Song, int64, error) {
	if page < 1 {
		page = 1
	}

	offset := (page - 1) * limit
	songs, err := s.songRepo.FindAll(offset, limit)
	if err != nil {
		return nil, -1, err
	}

	total, err := s.songRepo.Count()
	if err != nil {
		return nil, -1, err
	}
	return songs, total, nil
}

func (s *SongService) FindSongByID(id uint) (*entities.Song, error) {
	return s.songRepo.FindByID(id)
}

func (s *SongService) PatchSong(id uint, song *entities.Song) error {
	if song.Title == "" && song.Artist == "" {
		return appError.ErrInvalidData
	}
	return s.songRepo.Patch(id, song)
}

func (s *SongService) DeleteSong(id uint) error {
	return s.songRepo.Delete(id)
}
