package repository

import (
	"github.com/google/uuid"
	"github.com/mxilia/CEE-Final/internal/entities"
	"gorm.io/gorm"
)

type GormUserRepository struct {
	db *gorm.DB
}

func NewGormUserRepository(db *gorm.DB) UserRepository {
	return &GormUserRepository{db: db}
}

func (r *GormUserRepository) Save(user *entities.User) error {
	if err := r.db.Create(user).Error; err != nil {
		return err
	}
	return nil
}

func (r *GormUserRepository) FindAll(offset int, limit int) ([]*entities.User, error) {
	var usersValue []entities.User
	if err := r.db.Limit(limit).Offset(offset).Find(&usersValue).Error; err != nil {
		return nil, err
	}

	users := make([]*entities.User, len(usersValue))
	for i := range usersValue {
		users[i] = &usersValue[i]
	}
	return users, nil
}

func (r *GormUserRepository) FindByID(id uuid.UUID) (*entities.User, error) {
	var user entities.User
	if err := r.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *GormUserRepository) FindByHandler(handler string) (*entities.User, error) {
	var user entities.User
	if err := r.db.Where("handler = ?", handler).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *GormUserRepository) FindByEmail(email string) (*entities.User, error) {
	var user entities.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *GormUserRepository) Count() (int64, error) {
	var count int64
	if err := r.db.Model(&entities.User{}).Count(&count).Error; err != nil {
		return -1, err
	}
	return count, nil
}

func (r *GormUserRepository) Patch(id uuid.UUID, user *entities.User) error {
	result := r.db.Model(&entities.User{}).Where("id = ?", id).Updates(user)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *GormUserRepository) Delete(id uuid.UUID) error {
	result := r.db.Delete(&entities.User{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
