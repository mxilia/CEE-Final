package app

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mxilia/CEE-Final/pkg/config"
	"github.com/mxilia/CEE-Final/pkg/database"
	"github.com/mxilia/CEE-Final/pkg/middleware"
	"github.com/mxilia/CEE-Final/pkg/routes"
	"gorm.io/gorm"
)

func setupDependencies(env string) (*gorm.DB, *config.Config, error) {
	cfg := config.GetConfig(env)

	db, err := database.Connect(cfg)
	if err != nil {
		return nil, nil, err
	}

	if env == "dev" {
		//db.Migrator().DropTable(&entities.Thread{}, &entities.User{}, &entities.Post{}, &entities.Like{}, &entities.Comment{}, &entities.Session{}, &entities.Announcement{})
	}

	/*
		if err := db.AutoMigrate(&entities.Thread{}, &entities.User{}, &entities.Post{}, &entities.Like{}, &entities.Comment{}, &entities.Session{}, &entities.Announcement{}); err != nil {
			return nil, nil, err
		}
	*/
	return db, cfg, nil
}

func setupRestServer(db *gorm.DB, cfg *config.Config) (*fiber.App, error) {
	app := fiber.New(fiber.Config{
		BodyLimit: 1 * 1024 * 1024,
	})
	middleware.FiberMiddleware(app, cfg)
	routes.RegisterPublicRoutes(app, db, cfg)
	routes.RegisterPrivateRoutes(app, db, cfg)
	routes.RegisterNotFoundRoute(app)
	return app, nil
}
