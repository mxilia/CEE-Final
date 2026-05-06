package routes

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	userHandler "github.com/mxilia/CEE-Final/internal/user/handler/rest"
	userRepository "github.com/mxilia/CEE-Final/internal/user/repository"
	userUseCase "github.com/mxilia/CEE-Final/internal/user/usecase"

	sessionRepository "github.com/mxilia/CEE-Final/internal/session/repository"
	sessionUseCase "github.com/mxilia/CEE-Final/internal/session/usecase"

	"github.com/mxilia/CEE-Final/pkg/config"
)

func RegisterPublicRoutes(app *fiber.App, db *gorm.DB, cfg *config.Config) {

	/* === Dependencies Wiring === */

	// txManager := transaction.NewGormTxManager(db)

	sessionRepo := sessionRepository.NewGormSessionRepository(db)
	sessionUseCase := sessionUseCase.NewSessionService(sessionRepo)

	userRepo := userRepository.NewGormUserRepository(db)
	userUseCase := userUseCase.NewUserService(userRepo)
	userHandler := userHandler.NewHttpUserHandler(userUseCase, sessionUseCase, cfg)

	/* === Routes === */

	api := app.Group("/api/v1")

	authGroup := api.Group("/auth")

	googleAuthGroup := authGroup.Group("/google")

	googleAuthGroup.Get("/login", userHandler.GoogleLogin)
	googleAuthGroup.Get("/callback", userHandler.GoogleCallBack)

	userGroup := api.Group("/users")

	userGroup.Get("/", userHandler.FindAllUsers)
	userGroup.Get("/:id", userHandler.FindUserByID)
	userGroup.Get("/handler/:handler", userHandler.FindUserByHandler)
	userGroup.Get("/email/:email", userHandler.FindUserByEmail)
}
