package token

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type UserClaims struct {
	ID    uuid.UUID `json:"id"`
	Email string    `json:"email"`
	Role  string    `gorm:"type:varchar(20);default:'member';check:role IN ('member','admin','owner')" json:"role"`
	jwt.RegisteredClaims
}

func NewUserClaims(id uuid.UUID, email string, duration time.Duration) (*UserClaims, error) {
	tokenID, err := uuid.NewRandom()
	if err != nil {
		return nil, fmt.Errorf("error generating token ID: %w", err)
	}
	return &UserClaims{
		ID:    id,
		Email: email,
		Role:  "member",
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        tokenID.String(),
			Subject:   email,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
		},
	}, nil
}
