package playhistory

import (
	"context"
	"math"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mxilia/CEE-Final/internal/entities"
	"github.com/mxilia/CEE-Final/internal/transaction"
	"github.com/mxilia/CEE-Final/internal/user/usecase"
	appError "github.com/mxilia/CEE-Final/pkg/apperror"
	"github.com/mxilia/CEE-Final/pkg/responses"
	"gorm.io/gorm"
)

type HttpPlayHistoryHandler struct {
	db           *gorm.DB
	userUserCase usecase.UserUseCase
	txManager    transaction.TransactionManager
}

func NewHttpPlayHistoryHandler(db *gorm.DB, userUserCase usecase.UserUseCase, txManager transaction.TransactionManager) *HttpPlayHistoryHandler {
	return &HttpPlayHistoryHandler{db: db, userUserCase: userUserCase, txManager: txManager}
}

func (h *HttpPlayHistoryHandler) CreatePlayHistory(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return responses.Error(c, appError.ErrInvalidData)
	}
	playHistory := &entities.PlayHistory{UserID: userID}
	if err := c.BodyParser(playHistory); err != nil {
		return responses.Error(c, appError.ErrInvalidData)
	}
	playHistory.UserID = userID

	err := h.txManager.Do(c.Context(), func(txCtx context.Context) error {
		tx := transaction.GetTx(txCtx, h.db)
		if err := tx.Create(playHistory).Error; err != nil {
			return appError.ErrInternalServer
		}
		if err := h.userUserCase.UpdateUserMinutesPlayed(userID, playHistory.MinutesPlayed); err != nil {
			return appError.ErrInternalServer
		}
		if err := h.userUserCase.UpdateUserSingCount(userID, 1); err != nil {
			return appError.ErrInternalServer
		}
		if err := h.userUserCase.UpdateUserTotalScore(tx, userID, playHistory.TotalScore); err != nil {
			return appError.ErrInternalServer
		}
		if err := h.userUserCase.UpdateUserAccuracy(userID, playHistory.Accuracy); err != nil {
			return appError.ErrInternalServer
		}
		if err := h.userUserCase.UpdateUserMaxCombo(userID, playHistory.MaxCombo); err != nil {
			return appError.ErrInternalServer
		}

		return nil
	})
	if err != nil {
		return responses.Error(c, err)
	}

	return c.Status(201).JSON(playHistory)
}

func (h *HttpPlayHistoryHandler) GetPlayHistoryByUserID(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return responses.Error(c, appError.ErrInvalidData)
	}
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)

	var totalPlayHistories int64
	if err := h.db.Model(&entities.PlayHistory{}).Where("user_id = ?", userID).Count(&totalPlayHistories).Error; err != nil {
		return responses.Error(c, appError.ErrInternalServer)
	}

	var playHistories []entities.PlayHistory
	offset := (page - 1) * limit
	if err := h.db.Where("user_id = ?", userID).Preload("Song").Order("created_at DESC").Limit(limit).Offset(offset).Find(&playHistories).Error; err != nil {
		return responses.Error(c, appError.ErrInternalServer)
	}

	return c.JSON(fiber.Map{
		"data": playHistories,
		"meta": fiber.Map{
			"page":       page,
			"total":      totalPlayHistories,
			"totalPages": int(math.Ceil(float64(totalPlayHistories) / float64(limit))),
		},
	})
}

func (h *HttpPlayHistoryHandler) GetBestPerformance(c *fiber.Ctx) error {
	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return responses.Error(c, appError.ErrInvalidData)
	}

	var bestPlayHistory entities.PlayHistory
	if err := h.db.Where("user_id = ?", userID).Preload("Song").Order("total_score DESC").First(&bestPlayHistory).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(fiber.Map{"data": nil})
		}
		return responses.Error(c, appError.ErrInternalServer)
	}

	return c.JSON(fiber.Map{"data": bestPlayHistory})
}
