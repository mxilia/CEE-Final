package rest

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"math"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mxilia/CEE-Final/internal/entities"
	sessionUseCase "github.com/mxilia/CEE-Final/internal/session/usecase"
	"github.com/mxilia/CEE-Final/internal/user/dto"
	"github.com/mxilia/CEE-Final/internal/user/usecase"
	appError "github.com/mxilia/CEE-Final/pkg/apperror"
	"github.com/mxilia/CEE-Final/pkg/config"
	"github.com/mxilia/CEE-Final/pkg/responses"
	"github.com/mxilia/CEE-Final/pkg/token"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type HttpUserHandler struct {
	usecase           usecase.UserUseCase
	oauthGoogleConfig *oauth2.Config
	cfg               *config.Config
	tokenMaker        *token.JWTMaker
	sessionUseCase    sessionUseCase.SessionUseCase
}

func NewHttpUserHandler(userUseCase usecase.UserUseCase, sessionUseCase sessionUseCase.SessionUseCase, cfg *config.Config) *HttpUserHandler {
	return &HttpUserHandler{
		usecase: userUseCase,
		oauthGoogleConfig: &oauth2.Config{
			ClientID:     cfg.GOOGLE_CLIENT_ID,
			ClientSecret: cfg.GOOGLE_CLIENT_SECRET,
			RedirectURL:  cfg.GOOGLE_OAUTH_REDIRECT_URL,
			Scopes:       []string{"email", "profile"},
			Endpoint:     google.Endpoint,
		},
		cfg:            cfg,
		tokenMaker:     token.NewJWTMaker(cfg),
		sessionUseCase: sessionUseCase,
	}
}

func removeToken(c *fiber.Ctx, h *HttpUserHandler) {
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

func checkUserForbidAction(c *fiber.Ctx, h *HttpUserHandler, targetID uuid.UUID) error {
	existedUser, err := h.usecase.FindUserByID(targetID)
	if err != nil {
		return err
	}

	if c.Locals("role").(string) == "member" && existedUser.ID != c.Locals("user_id") {
		return appError.ErrForbidden
	}
	return nil
}

func (h *HttpUserHandler) GetUser(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return responses.Error(c, appError.ErrUnauthorized)
	}

	user, err := h.usecase.FindUserByID(userID)
	if err != nil {
		return responses.Error(c, err)
	}

	return c.JSON(dto.ToUserResponse(user))
}

func (h *HttpUserHandler) GoogleLogin(c *fiber.Ctx) error {
	b := make([]byte, 16)
	rand.Read(b)
	state := base64.URLEncoding.EncodeToString(b)
	c.Cookie(&fiber.Cookie{
		Name:     "oauthstate",
		Value:    state,
		Expires:  time.Now().Add(10 * time.Minute),
		HTTPOnly: true,
	})
	url := h.oauthGoogleConfig.AuthCodeURL(state, oauth2.AccessTypeOffline, oauth2.ApprovalForce, oauth2.SetAuthURLParam("prompt", "consent select_account"))
	return c.Redirect(url, fiber.StatusTemporaryRedirect)
}

func (h *HttpUserHandler) GoogleCallBack(c *fiber.Ctx) error {
	state := c.Cookies("oauthstate")
	if c.Query("state") != state {
		return responses.ErrorWithMessage(c, appError.ErrUnauthorized, "invalid oauth state")
	}

	code := c.Query("code")
	if code == "" {
		return responses.ErrorWithMessage(c, appError.ErrInvalidData, "code not found")
	}

	token, err := h.oauthGoogleConfig.Exchange(c.Context(), code)
	if err != nil {
		return responses.ErrorWithMessage(c, appError.ErrInternalServer, "cannot exchange token")
	}

	client := h.oauthGoogleConfig.Client(c.Context(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		return responses.ErrorWithMessage(c, err, "failed to get user info from google api")
	}
	defer resp.Body.Close()

	var googleReq dto.CreateUserByGoogleRequest
	if err := json.NewDecoder(resp.Body).Decode(&googleReq); err != nil {
		return responses.ErrorWithMessage(c, err, "failed to decode user info")
	}

	user, err := h.usecase.GoogleUserEntry(dto.FromCreateUserByGoogleRequest(&googleReq))
	if err != nil {
		return responses.ErrorWithMessage(c, err, "failed to login via google")
	}

	accessToken, accessClaims, err := h.tokenMaker.CreateToken(user.ID, user.Email, 10*time.Minute)
	if err != nil {
		return responses.ErrorWithMessage(c, appError.ErrInternalServer, "failed to create token")
	}

	refreshToken, refreshClaims, err := h.tokenMaker.CreateToken(user.ID, user.Email, 30*24*time.Hour)
	if err != nil {
		return responses.ErrorWithMessage(c, appError.ErrInternalServer, "failed to create token")
	}

	session := &entities.Session{
		ID:           refreshClaims.RegisteredClaims.ID,
		UserEmail:    user.Email,
		RefreshToken: refreshToken,
		IsRevoked:    false,
		ExpiresAt:    refreshClaims.RegisteredClaims.ExpiresAt.Time,
	}
	if err := h.sessionUseCase.CreateSession(session); err != nil {
		return responses.ErrorWithMessage(c, appError.ErrInternalServer, "failed to create session")
	}

	c.Cookie(&fiber.Cookie{
		Name:     "oauthstate",
		Expires:  time.Now(),
		HTTPOnly: true,
		Secure:   false,
	})

	c.Cookie(&fiber.Cookie{
		Name:     "accessToken",
		Value:    accessToken,
		Expires:  accessClaims.RegisteredClaims.ExpiresAt.Time,
		HTTPOnly: true,
		Secure:   h.cfg.Env == "production",
		SameSite: "Lax",
		Domain:   h.cfg.Domain,
	})

	c.Cookie(&fiber.Cookie{
		Name:     "refreshToken",
		Value:    refreshToken,
		Expires:  refreshClaims.RegisteredClaims.ExpiresAt.Time,
		HTTPOnly: true,
		Secure:   h.cfg.Env == "production",
		SameSite: "Lax",
		Domain:   h.cfg.Domain,
	})

	return c.Redirect(h.cfg.FRONTEND_OAUTH_REDIRECT_URL, fiber.StatusSeeOther)
}

func (h *HttpUserHandler) FindAllUsers(c *fiber.Ctx) error {
	var (
		page  = c.QueryInt("page", 1)
		limit = 10
	)

	users, totalUsers, err := h.usecase.FindAllUsers(page, limit)
	if err != nil {
		return responses.Error(c, err)
	}
	return c.JSON(fiber.Map{
		"data": dto.ToUserResponseList(users),
		"meta": fiber.Map{
			"page":       page,
			"total":      totalUsers,
			"totalPages": int(math.Ceil(float64(totalUsers) / float64(limit))),
		},
	},
	)
}

func (h *HttpUserHandler) FindUserByID(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return responses.ErrorWithMessage(c, appError.ErrInvalidData, "invalid id")
	}

	user, err := h.usecase.FindUserByID(userID)
	if err != nil {
		return responses.ErrorWithMessage(c, err, "failed to find user by id")
	}
	return c.JSON(dto.ToUserResponse(user))
}

func (h *HttpUserHandler) FindUserByHandler(c *fiber.Ctx) error {
	user, err := h.usecase.FindUserByHandler(c.Params("handler"))
	if err != nil {
		return responses.Error(c, err)
	}
	return c.JSON(dto.ToUserResponse(user))
}

func (h *HttpUserHandler) FindUserByEmail(c *fiber.Ctx) error {
	user, err := h.usecase.FindUserByEmail(c.Params("email"))
	if err != nil {
		return responses.Error(c, err)
	}
	return c.JSON(dto.ToUserResponse(user))
}

func (h *HttpUserHandler) PatchUser(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return responses.ErrorWithMessage(c, appError.ErrInvalidData, "invalid id")
	}

	var req dto.UserPatchRequest
	if err := c.BodyParser(&req); err != nil {
		return responses.Error(c, err)
	}

	userInfo := dto.FromUserPatchRequest(&req)

	err = checkUserForbidAction(c, h, userID)
	if err != nil {
		return responses.Error(c, err)
	}

	if err := h.usecase.PatchUser(userID, userInfo); err != nil {
		return responses.Error(c, err)
	}

	return responses.Message(c, fiber.StatusOK, "patch successfully")
}

func (h *HttpUserHandler) DeleteUser(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return responses.ErrorWithMessage(c, appError.ErrInvalidData, "invalid id")
	}

	err = checkUserForbidAction(c, h, userID)
	if err != nil {
		return responses.Error(c, err)
	}

	tokenStr := c.Cookies("refreshToken")
	claims, err := h.tokenMaker.VerifyToken(tokenStr)
	if err != nil {
		if userID == claims.ID {
			removeToken(c, h)
		}
		return responses.Error(c, appError.ErrUnauthorized)
	}

	if userID == claims.ID {
		if err := h.sessionUseCase.DeleteSession(claims.RegisteredClaims.ID); err != nil {
			removeToken(c, h)
			return responses.ErrorWithMessage(c, err, "session error")
		}
	}

	if err := h.usecase.DeleteUser(userID); err != nil {
		return responses.ErrorWithMessage(c, err, "failed to delete user by id")
	}

	if userID == claims.ID {
		removeToken(c, h)
	}

	return responses.Message(c, fiber.StatusOK, "deleted successfully")
}

func (h *HttpUserHandler) GetRanking(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return responses.ErrorWithMessage(c, appError.ErrInvalidData, "invalid id")
	}

	ranking, err := h.usecase.FindRanking(userID)
	if err != nil {
		return responses.ErrorWithMessage(c, err, "failed to get user ranking")
	}
	return c.JSON(fiber.Map{
		"ranking": ranking,
	})
}
