package usecase

import (
	"github.com/mxilia/CEE-Final/internal/entities"
	"github.com/mxilia/CEE-Final/internal/session/repository"
)

type SessionService struct {
	repo repository.SessionRepository
}

func NewSessionService(repo repository.SessionRepository) SessionUseCase {
	return &SessionService{repo: repo}
}

func (s *SessionService) CreateSession(session *entities.Session) error {
	if err := s.repo.Save(session); err != nil {
		return err
	}
	return nil
}

func (s *SessionService) FindSessionByID(id string) (*entities.Session, error) {
	session, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	return session, nil
}

func (s *SessionService) RevokeSession(email string) error {
	if err := s.repo.Revoke(email); err != nil {
		return err
	}
	return nil
}

func (s *SessionService) DeleteSession(id string) error {
	if err := s.repo.Delete(id); err != nil {
		return err
	}
	return nil
}
