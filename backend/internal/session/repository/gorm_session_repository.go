package repository

import (
	"github.com/google/uuid"
	"github.com/mxilia/CEE-Final/internal/entities"
	"gorm.io/gorm"
)

type GormSessionRepository struct {
	db *gorm.DB
}

func NewGormSessionRepository(db *gorm.DB) SessionRepository {
	return &GormSessionRepository{db: db}
}

func (r *GormSessionRepository) Save(session *entities.Session) error {
	if err := r.db.Create(session).Error; err != nil {
		return err
	}
	return nil
}

func (r *GormSessionRepository) FindByID(id string) (*entities.Session, error) {
	sessionID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}

	var session entities.Session
	if err := r.db.First(&session, sessionID).Error; err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *GormSessionRepository) Revoke(email string) error {
	result := r.db.Model(&entities.Session{}).Where("user_email = ?", email).Update("is_revoked", true)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *GormSessionRepository) Delete(id string) error {
	sessionID, err := uuid.Parse(id)
	if err != nil {
		return err
	}

	result := r.db.Delete(&entities.Session{}, sessionID)
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
