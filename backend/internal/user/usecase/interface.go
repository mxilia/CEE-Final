package usecase

import (
	"github.com/google/uuid"
	"github.com/mxilia/CEE-Final/internal/entities"
)

type UserUseCase interface {
	GoogleUserEntry(user *entities.User) (*entities.User, error)
	FindAllUsers(page int, limit int) ([]*entities.User, int64, error)
	FindUserByID(id uuid.UUID) (*entities.User, error)
	FindUserByHandler(handler string) (*entities.User, error)
	FindUserByEmail(email string) (*entities.User, error)
	UpdateUserTotalScore(userID uuid.UUID, score int) error
	PatchUser(id uuid.UUID, user *entities.User) error
	DeleteUser(id uuid.UUID) error
}
