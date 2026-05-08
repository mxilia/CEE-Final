package routes

import (
	"github.com/gofiber/fiber/v2"

	karaokeHandler "github.com/mxilia/CEE-Final/internal/karaoke/handler/rest"
	"github.com/mxilia/CEE-Final/internal/transaction"

	sessionHandler "github.com/mxilia/CEE-Final/internal/session/handler/rest"
	sessionRepository "github.com/mxilia/CEE-Final/internal/session/repository"
	sessionUseCase "github.com/mxilia/CEE-Final/internal/session/usecase"

	userHandler "github.com/mxilia/CEE-Final/internal/user/handler/rest"
	userRepository "github.com/mxilia/CEE-Final/internal/user/repository"
	userUseCase "github.com/mxilia/CEE-Final/internal/user/usecase"

	"github.com/mxilia/CEE-Final/pkg/config"
	"github.com/mxilia/CEE-Final/pkg/middleware"
	"gorm.io/gorm"
)

func RegisterPrivateRoutes(app *fiber.App, db *gorm.DB, cfg *config.Config) {

	/* === Dependencies Wiring === */

	txManager := transaction.NewGormTxManager(db)

	sessionRepo := sessionRepository.NewGormSessionRepository(db)
	sessionUseCase := sessionUseCase.NewSessionService(sessionRepo)

	userRepo := userRepository.NewGormUserRepository(db)
	userUseCase := userUseCase.NewUserService(userRepo)
	userHandler := userHandler.NewHttpUserHandler(userUseCase, sessionUseCase, cfg)

	sessionHandler := sessionHandler.NewHttpSessionHandler(sessionUseCase, userUseCase, cfg)
	karaokeJobHandler := karaokeHandler.NewHttpKaraokeJobHandler(db, txManager, cfg)

	/* === Routes === */

	api := app.Group("/api/v1", middleware.JWTMiddleware(cfg, sessionUseCase, userUseCase))

	api.Get("/me", userHandler.GetUser)

	authGroup := api.Group("/auth")

	authGroup.Post(
		"/logout",
		sessionHandler.Logout,
	)

	userGroup := api.Group("/users")

	userGroup.Patch(
		"/:id",
		userHandler.PatchUser,
	)
	userGroup.Delete(
		"/:id",
		userHandler.DeleteUser,
	)

	karaokeGroup := api.Group("/karaoke")
	karaokeJobsGroup := karaokeGroup.Group("/jobs")
	karaokeJobsGroup.Post("/", karaokeJobHandler.CreateJob)
}
