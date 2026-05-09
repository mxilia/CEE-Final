package repository

import (
	"strings"

	"github.com/mxilia/CEE-Final/internal/entities"
	"gorm.io/gorm"
)

type GormSongRepository struct {
	db *gorm.DB
}

func NewGormSongRepository(db *gorm.DB) SongRepository {
	return &GormSongRepository{db: db}
}

func (r *GormSongRepository) Save(song *entities.Song) error {
	if err := r.db.Create(song).Error; err != nil {
		return err
	}
	return nil
}

func (r *GormSongRepository) FindAll(title string, offset int, limit int) ([]*entities.Song, error) {

	var songsValue []entities.Song
	query := r.db.
		Limit(limit).
		Offset(offset).
		Order("created_at DESC")
	if title != "" {
		query = query.Where(
			"LOWER(title) LIKE ?",
			"%"+strings.ToLower(title)+"%",
		)
	}
	if err := query.Find(&songsValue).Error; err != nil {
		return nil, err
	}
	songs := make([]*entities.Song, len(songsValue))
	for i := range songsValue {
		songs[i] = &songsValue[i]
	}
	return songs, nil

}

func (r *GormSongRepository) FindByID(id uint) (*entities.Song, error) {
	var song entities.Song
	if err := r.db.First(&song, id).Error; err != nil {
		return nil, err
	}
	return &song, nil
}

func (r *GormSongRepository) Count() (int64, error) {
	var count int64
	if err := r.db.Model(&entities.Song{}).Count(&count).Error; err != nil {
		return -1, err
	}
	return count, nil
}

func (r *GormSongRepository) Patch(id uint, song *entities.Song) error {
	result := r.db.Model(&entities.Song{}).Where("id = ?", id).Updates(song)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *GormSongRepository) Delete(id uint) error {
	result := r.db.Delete(&entities.Song{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
