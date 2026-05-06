package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/mxilia/CEE-Final/pkg/config"
)

func FiberMiddleware(app *fiber.App, cfg *config.Config) {
	app.Use(
		logger.New(),
		cors.New(cors.Config{
			AllowOrigins:     cfg.FRONTEND_URL,
			AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
			AllowCredentials: true,
		}),
	)
}
