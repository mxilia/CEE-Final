package responses

import (
	"github.com/gofiber/fiber/v2"
	appError "github.com/mxilia/CEE-Final/pkg/apperror"
)

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

func Error(c *fiber.Ctx, err error) error {
	return c.Status(appError.StatusCode(err)).JSON(ErrorResponse{Error: err.Error()})
}

func ErrorWithMessage(c *fiber.Ctx, err error, message string) error {
	return c.Status(appError.StatusCode(err)).JSON(ErrorResponse{Error: err.Error(), Message: message})
}
