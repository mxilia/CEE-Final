package rest

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/mxilia/CEE-Final/internal/session/usecase"
	userUseCase "github.com/mxilia/CEE-Final/internal/user/usecase"
	appError "github.com/mxilia/CEE-Final/pkg/apperror"
	"github.com/mxilia/CEE-Final/pkg/config"
	"github.com/mxilia/CEE-Final/pkg/responses"
	"github.com/mxilia/CEE-Final/pkg/token"
)

type HttpSessionHandler struct {
	usecase     usecase.SessionUseCase
	userUseCase userUseCase.UserUseCase
	tokenMaker  *token.JWTMaker
	cfg         *config.Config
}

func NewHttpSessionHandler(usecase usecase.SessionUseCase, userUseCase userUseCase.UserUseCase, cfg *config.Config) *HttpSessionHandler {
	return &HttpSessionHandler{
		usecase:     usecase,
		userUseCase: userUseCase,
		tokenMaker:  token.NewJWTMaker(cfg),
		cfg:         cfg,
	}
}

func removeToken(c *fiber.Ctx, h *HttpSessionHandler) {
	c.Cookie(&fiber.Cookie{
		Name:     "accessToken",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
		Domain:   h.cfg.Domain,
	})
	c.Cookie(&fiber.Cookie{
		Name:     "refreshToken",
		Value:    "",
		Expires:  time.Now().Add(-time.Hour),
		HTTPOnly: true,
		Domain:   h.cfg.Domain,
	})
}

/*
func (h *HttpSessionHandler) RenewToken(c *fiber.Ctx) error {
	tokenStr := c.Cookies("token")
	fmt.Println("refreshtoken:", tokenStr)
	claims, err := h.tokenMaker.VerifyToken(tokenStr)
	if err != nil {
		removeToken(c, h)
		return responses.ErrorWithMessage(c, appError.ErrUnauthorized, "failed to parse")
	}

	session, err := h.usecase.FindSessionByID(claims.RegisteredClaims.ID)
	if err != nil {
		removeToken(c, h)
		return responses.ErrorWithMessage(c, appError.ErrUnauthorized, "failed to get session")
	}
	if session.IsRevoked {
		removeToken(c, h)
		return responses.ErrorWithMessage(c, appError.ErrUnauthorized, "session is revoked")
	}
	if session.UserEmail != claims.Email {
		removeToken(c, h)
		return responses.ErrorWithMessage(c, appError.ErrUnauthorized, "invalid email")
	}

	user, err := h.userUseCase.FindUserByEmail(claims.Email)
	if user == nil || err != nil {
		removeToken(c, h)
		return responses.ErrorWithMessage(c, appError.ErrUnauthorized, "user does not exist")
	}

	accessToken, accessClaims, err := h.tokenMaker.CreateToken(claims.ID, claims.Email, claims.Role, 10*time.Minute)
	if err != nil {
		return responses.ErrorWithMessage(c, appError.ErrInternalServer, "failed to create access token")
	}
	return c.JSON(dto.ToRenewAccessTokenResponse(accessToken, accessClaims))
}
*/

func (h *HttpSessionHandler) Logout(c *fiber.Ctx) error {
	tokenStr := c.Cookies("refreshToken")
	claims, err := h.tokenMaker.VerifyToken(tokenStr)
	if err != nil {
		removeToken(c, h)
		return responses.Error(c, appError.ErrUnauthorized)
	}

	if err := h.usecase.DeleteSession(claims.RegisteredClaims.ID); err != nil {
		return responses.Error(c, appError.ErrInternalServer)
	}
	removeToken(c, h)
	return responses.Message(c, fiber.StatusOK, "logged out successfully")
}

func (h *HttpSessionHandler) RevokeToken(c *fiber.Ctx) error {
	email := c.Params("email")
	if email == "" {
		return responses.Error(c, appError.ErrInvalidData)
	}

	if err := h.usecase.RevokeSession(email); err != nil {
		return responses.Error(c, err)
	}
	return responses.Message(c, fiber.StatusOK, "revoke successfully")
}
