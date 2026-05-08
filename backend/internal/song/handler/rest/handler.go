package rest

import (
	"math"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/mxilia/CEE-Final/internal/entities"
	"github.com/mxilia/CEE-Final/internal/song/usecase"
	appError "github.com/mxilia/CEE-Final/pkg/apperror"
	"github.com/mxilia/CEE-Final/pkg/responses"
	"gorm.io/gorm"
)

type HttpSongHandler struct {
	db          *gorm.DB
	songUseCase usecase.SongUseCase
}

func NewHttpSongHandler(db *gorm.DB, songUseCase usecase.SongUseCase) *HttpSongHandler {
	return &HttpSongHandler{
		db:          db,
		songUseCase: songUseCase,
	}
}

func parseUintParam(c *fiber.Ctx, key string) (uint, error) {
	value := c.Params(key)
	id, err := strconv.ParseUint(value, 10, 32)
	if err != nil {
		return 0, appError.ErrInvalidData
	}
	return uint(id), nil
}

func (h *HttpSongHandler) CreateSong(c *fiber.Ctx) error {
	song := &entities.Song{}
	if err := c.BodyParser(song); err != nil {
		return responses.Error(c, appError.ErrInvalidData)
	}

	if err := h.songUseCase.CreateSong(song); err != nil {
		return responses.Error(c, err)
	}
	return c.Status(201).JSON(song)
}

func (h *HttpSongHandler) FindAllSongs(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)

	songs, totalSongs, err := h.songUseCase.FindAllSongs(page, limit)
	if err != nil {
		return responses.Error(c, err)
	}

	return c.JSON(fiber.Map{
		"data": songs,
		"meta": fiber.Map{
			"page":       page,
			"total":      totalSongs,
			"totalPages": int(math.Ceil(float64(totalSongs) / float64(limit))),
		},
	})
}

func (h *HttpSongHandler) FindSongByID(c *fiber.Ctx) error {
	songID, err := parseUintParam(c, "id")
	if err != nil {
		return responses.Error(c, err)
	}

	song, err := h.songUseCase.FindSongByID(songID)
	if err != nil {
		return responses.Error(c, err)
	}
	return c.JSON(song)
}
