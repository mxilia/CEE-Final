package dto

import (
	"time"

	"github.com/google/uuid"
)

type UserResponse struct {
	ID            uuid.UUID `json:"id"`
	Handler       string    `json:"handler"`
	Email         string    `json:"email"`
	ProfileUrl    string    `json:"profile_url"`
	TotalScore    int       `json:"total_score"`
	Accuracy      float64   `json:"accuracy"`
	MaxCombo      int       `json:"max_combo"`
	SingCount     int       `json:"sing_count"`
	MinutesPlayed float64   `json:"minutes_played"`
	CreatedAt     time.Time `json:"created_at"`
}
