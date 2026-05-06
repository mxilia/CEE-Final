package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/mxilia/CEE-Final/pkg/config"
	"github.com/mxilia/CEE-Final/pkg/responses"
	"github.com/mxilia/CEE-Final/pkg/token"

	sessionUseCase "github.com/mxilia/CEE-Final/internal/session/usecase"
	userUseCase "github.com/mxilia/CEE-Final/internal/user/usecase"
	appError "github.com/mxilia/CEE-Final/pkg/apperror"
)

func removeToken(name string, c *fiber.Ctx, cfg *config.Config) {
	c.Cookie(&fiber.Cookie{
		Name:     name,
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
		Domain:   cfg.Domain,
	})
}

func JWTMiddleware(cfg *config.Config, sessionUseCase sessionUseCase.SessionUseCase, userUseCase userUseCase.UserUseCase) fiber.Handler {
	tokenMaker := token.NewJWTMaker(cfg)

	return func(c *fiber.Ctx) error {
		accessClaims, err := tokenMaker.VerifyToken(c.Cookies("accessToken"))
		if err == nil {
			c.Locals("user_id", accessClaims.ID)
			c.Locals("role", accessClaims.Role)
			return c.Next()
		}

		removeToken("accessToken", c, cfg)
		refreshClaims, err := tokenMaker.VerifyToken(c.Cookies("refreshToken"))
		if err != nil {
			removeToken("refreshToken", c, cfg)
			if refreshClaims != nil {
				if err := sessionUseCase.DeleteSession(refreshClaims.RegisteredClaims.ID); err != nil {
					return responses.Error(c, err)
				}
			}
			return responses.ErrorWithMessage(c, appError.ErrUnauthorized, "session expired")
		}

		session, err := sessionUseCase.FindSessionByID(refreshClaims.RegisteredClaims.ID)
		if err != nil {
			removeToken("refreshToken", c, cfg)
			return responses.ErrorWithMessage(c, appError.ErrUnauthorized, "failed to get session")
		}
		if session.IsRevoked {
			removeToken("refreshToken", c, cfg)
			return responses.ErrorWithMessage(c, appError.ErrUnauthorized, "session is revoked")
		}
		if session.UserEmail != refreshClaims.Email {
			removeToken("refreshToken", c, cfg)
			return responses.ErrorWithMessage(c, appError.ErrUnauthorized, "invalid email")
		}

		user, err := userUseCase.FindUserByEmail(refreshClaims.Email)
		if user == nil || err != nil {
			removeToken("refreshToken", c, cfg)
			return responses.ErrorWithMessage(c, appError.ErrUnauthorized, "user does not exist")
		}

		accessToken, accessClaims, err := tokenMaker.CreateToken(refreshClaims.ID, refreshClaims.Email, 10*time.Minute)
		if err != nil {
			return responses.ErrorWithMessage(c, appError.ErrInternalServer, "failed to create access token")
		}

		c.Cookie(&fiber.Cookie{
			Name:     "accessToken",
			Value:    accessToken,
			Expires:  accessClaims.RegisteredClaims.ExpiresAt.Time,
			HTTPOnly: true,
			Secure:   cfg.Env == "production",
			SameSite: "Lax",
			Domain:   cfg.Domain,
		})

		c.Locals("user_id", accessClaims.ID)
		c.Locals("role", accessClaims.Role)

		return c.Next()
	}
}
