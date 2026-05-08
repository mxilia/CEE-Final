package handler

import (
	"os"

	"github.com/gofiber/fiber/v2"
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
		return c.Status(404).JSON(fiber.Map{
			"error": "lyrics not found",
		})
	}
	return c.Type("json").Send(data)
}

func (h *HttpKaraokeHandler) GetPitch(c *fiber.Ctx) error {
	id := c.Params("id")
	path := "./asset/songs/" + id + "/pitch.json"
	data, err := os.ReadFile(path)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "pitch not found",
		})
	}
	return c.Type("json").Send(data)
}

func (h *HttpKaraokeHandler) GetInstrumental(c *fiber.Ctx) error {
	id := c.Params("id")
	path := "./asset/songs/" + id + "/instrumental.mp3"
	if _, err := os.Stat(path); err != nil {
		return c.Status(404).JSON(fiber.Map{
			"error": "instrumental not found",
		})
	}
	return c.SendFile(path)
}
