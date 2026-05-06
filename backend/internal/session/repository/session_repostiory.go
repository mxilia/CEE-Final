package repository

import "github.com/mxilia/CEE-Final/internal/entities"

type SessionRepository interface {
	Save(session *entities.Session) error
	FindByID(id string) (*entities.Session, error)
	Revoke(email string) error
	Delete(id string) error
}
