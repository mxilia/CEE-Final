package repository

import (
	"github.com/google/uuid"
	"github.com/mxilia/CEE-Final/internal/entities"
)

type UserRepository interface {
	Save(user *entities.User) error
	FindAll(offset int, limit int) ([]*entities.User, error)
	FindByID(id uuid.UUID) (*entities.User, error)
	FindByHandler(handler string) (*entities.User, error)
	FindByEmail(email string) (*entities.User, error)
	FindRanking(id uuid.UUID) (int64, error)
	Count() (int64, error)
	Patch(id uuid.UUID, user *entities.User) error
	Delete(id uuid.UUID) error
}
