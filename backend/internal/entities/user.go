package entities

import (
	"regexp"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var usernameRegex = regexp.MustCompile(`^[a-zA-Z][a-zA-Z0-9_]{2,15}$`)

func IsValidUsername(username string) bool {
	return usernameRegex.MatchString(username)
}

type User struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Handler    string    `gorm:"type:varchar(255);uniqueKey" json:"handler"`
	Email      string    `gorm:"type:varchar(255);uniqueIndex" json:"email"`
	ProfileUrl string    `gorm:"type:varchar(512);default:''" json:"profile_url"`
	CreatedAt  time.Time `gorm:"timestamptz(3)" json:"created_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()

	}
	if u.Handler == "" {
		u.Handler = "user_" + uuid.NewString()[:8]
	}
	return nil
}
