package usecase

import (
	"errors"

	"github.com/google/uuid"
	"github.com/mxilia/CEE-Final/internal/entities"
	"github.com/mxilia/CEE-Final/internal/user/repository"
	appError "github.com/mxilia/CEE-Final/pkg/apperror"
	"gorm.io/gorm"
)

type UserService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) UserUseCase {
	return &UserService{repo: repo}
}

func (s *UserService) GoogleUserEntry(user *entities.User) (*entities.User, error) {
	if user.Email == "" {
		return nil, appError.ErrInvalidData
	}

	registeredUser, err := s.repo.FindByEmail(user.Email)
	if err != nil && !errors.Is(err, appError.ErrRecordNotFound) {
		return nil, err
	}
	if registeredUser != nil {
		if err := s.repo.Patch(registeredUser.ID, &entities.User{ProfileUrl: user.ProfileUrl}); err != nil {
			return nil, err
		}
		return registeredUser, nil
	}

	registeredUser = &entities.User{Email: user.Email, ProfileUrl: user.ProfileUrl}
	if err := s.repo.Save(registeredUser); err != nil {
		return nil, err
	}
	return registeredUser, nil
}

func (s *UserService) FindAllUsers(page int, limit int) ([]*entities.User, int64, error) {
	if page < 1 {
		page = 1
	}

	offset := (page - 1) * limit

	users, err := s.repo.FindAll(offset, limit)
	if err != nil {
		return nil, -1, err
	}

	totalUsers, err := s.repo.Count()
	if err != nil {
		return nil, -1, err
	}
	return users, totalUsers, nil
}

func (s *UserService) FindUserByID(id uuid.UUID) (*entities.User, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) FindUserByHandler(handler string) (*entities.User, error) {
	user, err := s.repo.FindByHandler(handler)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) FindUserByEmail(email string) (*entities.User, error) {
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) PatchUser(id uuid.UUID, user *entities.User) error {
	if user.Handler != "" {
		registeredUser, err := s.FindUserByHandler(user.Handler)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}
		if registeredUser != nil {
			return appError.ErrAlreadyExists
		}
		if !entities.IsValidUsername(user.Handler) {
			return appError.ErrInvalidData
		}
	}

	if err := s.repo.Patch(id, user); err != nil {
		return err
	}
	return nil
}

func (s *UserService) DeleteUser(id uuid.UUID) error {
	if err := s.repo.Delete(id); err != nil {
		return err
	}
	return nil
}
