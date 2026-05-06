package usecase

import "github.com/mxilia/CEE-Final/internal/entities"

type SessionUseCase interface {
	CreateSession(session *entities.Session) error
	FindSessionByID(id string) (*entities.Session, error)
	RevokeSession(email string) error
	DeleteSession(id string) error
}
