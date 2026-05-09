package routes

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	songHandler "github.com/mxilia/CEE-Final/internal/song/handler/rest"
	songRepository "github.com/mxilia/CEE-Final/internal/song/repository"
	songUseCase "github.com/mxilia/CEE-Final/internal/song/usecase"
	"github.com/mxilia/CEE-Final/internal/transaction"

	userHandler "github.com/mxilia/CEE-Final/internal/user/handler/rest"
	userRepository "github.com/mxilia/CEE-Final/internal/user/repository"
	userUseCase "github.com/mxilia/CEE-Final/internal/user/usecase"

	sessionRepository "github.com/mxilia/CEE-Final/internal/session/repository"
	sessionUseCase "github.com/mxilia/CEE-Final/internal/session/usecase"

	favoriteSongHandler "github.com/mxilia/CEE-Final/internal/favorite_song"
	karaokeHandler "github.com/mxilia/CEE-Final/internal/karaoke"
	playHistoryHandler "github.com/mxilia/CEE-Final/internal/play_history"

	"github.com/mxilia/CEE-Final/pkg/config"
)

func RegisterPublicRoutes(app *fiber.App, db *gorm.DB, cfg *config.Config) {

	/* === Dependencies Wiring === */

	txManager := transaction.NewGormTxManager(db)

	sessionRepo := sessionRepository.NewGormSessionRepository(db)
	sessionUseCase := sessionUseCase.NewSessionService(sessionRepo)

	userRepo := userRepository.NewGormUserRepository(db)
	userUseCase := userUseCase.NewUserService(userRepo)
	userHandler := userHandler.NewHttpUserHandler(userUseCase, sessionUseCase, cfg)

	songRepo := songRepository.NewGormSongRepository(db)
	songUseCase := songUseCase.NewSongService(songRepo)
	songHandler := songHandler.NewHttpSongHandler(db, songUseCase)

	KaraokeJobHandler := karaokeHandler.NewHttpKaraokeHandler()
	playHistoryHandler := playHistoryHandler.NewHttpPlayHistoryHandler(db, userUseCase, txManager)
	favoriteSongHandler := favoriteSongHandler.NewHttpFavoriteSongHandler(db, txManager)

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
	songGroup.Post("/", songHandler.CreateSong)
	songGroup.Get("/", songHandler.FindAllSongs)
	songGroup.Get("/:id", songHandler.FindSongByID)
	songGroup.Get("/:id/lyrics", KaraokeJobHandler.GetLyrics)
	songGroup.Get("/:id/pitch", KaraokeJobHandler.GetPitch)
	songGroup.Get("/:id/instrumental", KaraokeJobHandler.GetInstrumental)

	playHistoryGroup := api.Group("/play-history")
	playHistoryGroup.Get("/user/:id", playHistoryHandler.GetPlayHistoryByUserID)

	favoriteSongGroup := api.Group("/favorite-songs")
	favoriteSongGroup.Get("/user/:id", favoriteSongHandler.GetFavoriteSongsByUserID)
}
