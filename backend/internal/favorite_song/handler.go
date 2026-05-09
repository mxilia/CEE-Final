package favorite_song

import (
	"context"
	"errors"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mxilia/CEE-Final/internal/entities"
	"github.com/mxilia/CEE-Final/internal/transaction"
	appError "github.com/mxilia/CEE-Final/pkg/apperror"
	"github.com/mxilia/CEE-Final/pkg/responses"
	"gorm.io/gorm"
)

type HttpFavoriteSongHandler struct {
	db        *gorm.DB
	txManager transaction.TransactionManager
}

func NewHttpFavoriteSongHandler(db *gorm.DB, txManager transaction.TransactionManager) *HttpFavoriteSongHandler {
	return &HttpFavoriteSongHandler{db: db, txManager: txManager}
}

func (h *HttpFavoriteSongHandler) CreateFavoriteSong(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return responses.Error(c, appError.ErrInvalidData)
	}

	favoriteSong := &entities.FavoriteSong{UserID: userID}
	if err := c.BodyParser(favoriteSong); err != nil {
		return responses.Error(c, appError.ErrInvalidData)
	}
	favoriteSong.UserID = userID

	err := h.txManager.Do(c.Context(), func(txCtx context.Context) error {
		tx := transaction.GetTx(txCtx, h.db)
		oldFavoriteSong := &entities.FavoriteSong{}
		if err := tx.Where("user_id = ? AND song_id = ?", favoriteSong.UserID, favoriteSong.SongID).First(oldFavoriteSong).Error; err != nil {
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return appError.ErrInternalServer
			}
			if err := tx.Create(favoriteSong).Error; err != nil {
				return appError.ErrInternalServer
			}
		} else {
			if err := tx.Delete(oldFavoriteSong).Error; err != nil {
				return appError.ErrInternalServer
			}
		}
		return nil
	})
	if err != nil {
		return responses.Error(c, err)
	}

	return responses.Message(c, 202, "success")
}

func (h *HttpFavoriteSongHandler) GetFavoriteSongsByUserID(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return responses.Error(c, appError.ErrInvalidData)
	}
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)

	var totalFavoriteSongs int64
	if err := h.db.Model(&entities.FavoriteSong{}).Where("user_id = ?", userID).Count(&totalFavoriteSongs).Error; err != nil {
		return responses.Error(c, appError.ErrInternalServer)
	}

	var favoriteSongs []entities.FavoriteSong
	offset := (page - 1) * limit
	if err := h.db.Where("user_id = ?", userID).Order("created_at DESC").Preload("Song").Limit(limit).Offset(offset).Find(&favoriteSongs).Error; err != nil {
		return responses.Error(c, appError.ErrInternalServer)
	}

	return c.JSON(fiber.Map{
		"data": favoriteSongs,
		"meta": fiber.Map{
			"page":       page,
			"total":      totalFavoriteSongs,
			"totalPages": int(math.Ceil(float64(totalFavoriteSongs) / float64(limit))),
		},
	})
}

func (h *HttpFavoriteSongHandler) GetIsFavoriteSongByUser(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return responses.Error(c, appError.ErrInvalidData)
	}
	songID := c.Params("id")

	var favoriteSong entities.FavoriteSong
	if err := h.db.Where("user_id = ? AND song_id = ?", userID, songID).First(&favoriteSong).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(fiber.Map{"is_favorite": false})
		}
		return responses.Error(c, appError.ErrInternalServer)
	}
	return c.JSON(fiber.Map{"is_favorite": true})
}
