package responses

import (
	"github.com/gofiber/fiber/v2"
)

type MessageResponse struct {
	Message string `json:"message"`
}

func Message(c *fiber.Ctx, status int, message string) error {
	return c.Status(status).JSON(MessageResponse{Message: message})
}
