package routes

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	karaokeHandler "github.com/mxilia/CEE-Final/internal/karaoke/handler/rest"
	songHandler "github.com/mxilia/CEE-Final/internal/song/handler/rest"
	songRepository "github.com/mxilia/CEE-Final/internal/song/repository"
	songUseCase "github.com/mxilia/CEE-Final/internal/song/usecase"

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

	songRepo := songRepository.NewGormSongRepository(db)
	songDataRepo := songRepository.NewGormSongDataRepository(db)
	songSvc := songUseCase.NewSongService(songRepo, songDataRepo)
	songDataSvc := songUseCase.NewSongDataService(songDataRepo, songRepo)
	songHandler := songHandler.NewHttpSongHandler(db, songSvc, songDataSvc)

	karaokeJobHandler := karaokeHandler.NewHttpKaraokeJobHandler(db, cfg)

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

	songGroup := api.Group("/songs")
	songGroup.Get("/", songHandler.FindAllSongs)
	songGroup.Get("/:id", songHandler.FindSongByID)

	songDataGroup := api.Group("/song-data")
	songDataGroup.Get("/:song_id", songHandler.FindSongDataBySongID)

	karaokeGroup := api.Group("/karaoke")
	karaokeJobsGroup := karaokeGroup.Group("/jobs")
	karaokeJobsGroup.Post("/callback", karaokeJobHandler.UpsertFromCallback)
	karaokeJobsGroup.Get("/:job_id", karaokeJobHandler.GetJob)
}
