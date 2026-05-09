package dto

import (
	"time"

	"github.com/google/uuid"
)

type UserResponse struct {
	ID         uuid.UUID `json:"id"`
	Handler    string    `json:"handler"`
	Email      string    `json:"email"`
	ProfileUrl string    `json:"profile_url"`
	TotalScore int       `json:"total_score"`
	CreatedAt  time.Time `json:"created_at"`
}
