package usecase

import (
	"github.com/google/uuid"
	"github.com/mxilia/CEE-Final/internal/entities"
	"gorm.io/gorm"
)

type UserUseCase interface {
	GoogleUserEntry(user *entities.User) (*entities.User, error)
	FindAllUsers(page int, limit int) ([]*entities.User, int64, error)
	FindUserByID(id uuid.UUID) (*entities.User, error)
	FindUserByHandler(handler string) (*entities.User, error)
	FindUserByEmail(email string) (*entities.User, error)
	UpdateUserTotalScore(tx *gorm.DB, userID uuid.UUID, score int) error
	UpdateUserAccuracy(userID uuid.UUID, accuracy float64) error
	UpdateUserMaxCombo(userID uuid.UUID, maxCombo int) error
	UpdateUserSingCount(userID uuid.UUID, singCount int) error
	UpdateUserMinutesPlayed(userID uuid.UUID, minutes float64) error
	PatchUser(id uuid.UUID, user *entities.User) error
	DeleteUser(id uuid.UUID) error
}
