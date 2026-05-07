package repository

import (
	"github.com/mxilia/CEE-Final/internal/entities"
	"gorm.io/gorm"
)

type GormSongDataRepository struct {
	db *gorm.DB
}

func NewGormSongDataRepository(db *gorm.DB) SongDataRepository {
	return &GormSongDataRepository{db: db}
}

func (r *GormSongDataRepository) Save(songData *entities.SongData) error {
	if err := r.db.Create(songData).Error; err != nil {
		return err
	}
	return nil
}

func (r *GormSongDataRepository) FindBySongID(songID uint) (*entities.SongData, error) {
	var songData entities.SongData
	if err := r.db.Where("song_id = ?", songID).First(&songData).Error; err != nil {
		return nil, err
	}
	return &songData, nil
}

func (r *GormSongDataRepository) Patch(songID uint, songData *entities.SongData) error {
	result := r.db.Model(&entities.SongData{}).Where("song_id = ?", songID).Updates(songData)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *GormSongDataRepository) Delete(songID uint) error {
	result := r.db.Where("song_id = ?", songID).Delete(&entities.SongData{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
