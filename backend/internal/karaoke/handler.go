package karaoke

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/mxilia/CEE-Final/pkg/responses"
)

type HttpKaraokeHandler struct {
}

func NewHttpKaraokeHandler() *HttpKaraokeHandler {
	return &HttpKaraokeHandler{}
}

func (h *HttpKaraokeHandler) GetLyrics(c *fiber.Ctx) error {
	id := c.Params("id")
	path := "./asset/songs/" + id + "/lyrics.json"
	data, err := os.ReadFile(path)
	if err != nil {
		return responses.Error(c, fiber.NewError(fiber.StatusNotFound, "lyrics not found"))
	}
	return c.Type("json").Send(data)
}

func (h *HttpKaraokeHandler) GetPitch(c *fiber.Ctx) error {
	id := c.Params("id")
	path := "./asset/songs/" + id + "/pitch.json"
	data, err := os.ReadFile(path)
	if err != nil {
		return responses.Error(c, fiber.NewError(fiber.StatusNotFound, "pitch not found"))
	}
	return c.Type("json").Send(data)
}

func (h *HttpKaraokeHandler) GetInstrumental(c *fiber.Ctx) error {
	id := c.Params("id")
	path := "./asset/songs/" + id + "/instrumental.mp3"
	if _, err := os.Stat(path); err != nil {
		return responses.Error(c, fiber.NewError(fiber.StatusNotFound, "instrumental not found"))
	}
	return c.SendFile(path)
}
