package usecase

import (
	"github.com/mxilia/CEE-Final/internal/entities"
	"github.com/mxilia/CEE-Final/internal/song/repository"
	appError "github.com/mxilia/CEE-Final/pkg/apperror"
)

type SongService struct {
	songRepo     repository.SongRepository
	songDataRepo repository.SongDataRepository
}

func NewSongService(songRepo repository.SongRepository, songDataRepo repository.SongDataRepository) SongUseCase {
	return &SongService{songRepo: songRepo, songDataRepo: songDataRepo}
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
	if song.Title == "" && song.Artist == "" && song.UserID == 0 {
		return appError.ErrInvalidData
	}
	return s.songRepo.Patch(id, song)
}

func (s *SongService) DeleteSong(id uint) error {
	return s.songRepo.Delete(id)
}

type SongDataService struct {
	repo     repository.SongDataRepository
	songRepo repository.SongRepository
}

func NewSongDataService(repo repository.SongDataRepository, songRepo repository.SongRepository) SongDataUseCase {
	return &SongDataService{repo: repo, songRepo: songRepo}
}

func (s *SongDataService) CreateSongData(songData *entities.SongData) error {
	if songData.SongID == 0 {
		return appError.ErrInvalidData
	}
	if _, err := s.songRepo.FindByID(songData.SongID); err != nil {
		return err
	}
	return s.repo.Save(songData)
}

func (s *SongDataService) FindSongDataBySongID(songID uint) (*entities.SongData, error) {
	return s.repo.FindBySongID(songID)
}

func (s *SongDataService) PatchSongData(songID uint, songData *entities.SongData) error {
	if len(songData.FrequencyArray) == 0 && len(songData.Lyrics) == 0 {
		return appError.ErrInvalidData
	}
	return s.repo.Patch(songID, songData)
}

func (s *SongDataService) DeleteSongData(songID uint) error {
	return s.repo.Delete(songID)
}
