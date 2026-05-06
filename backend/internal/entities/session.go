package entities

import (
	"time"

	"gorm.io/gorm"
)

type Session struct {
	ID           string    `gorm:"type:uuid;primaryKey" json:"id"`
	UserEmail    string    `gorm:"type:varchar(255)" json:"user_email"`
	RefreshToken string    `gorm:"type:varchar(512)" json:"refresh_token"`
	IsRevoked    bool      `json:"is_revoked"`
	CreatedAt    time.Time `gorm:"type:timestamptz(3)" json:"created_at"`
	ExpiresAt    time.Time `gorm:"type:timestamptz(3)" json:"expires_at"`
}

func (u *Session) BeforeCreate(db *gorm.DB) (err error) {
	u.CreatedAt = time.Now()
	return
}
