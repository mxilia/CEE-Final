package totalscore

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/mxilia/CEE-Final/internal/entities"
	appError "github.com/mxilia/CEE-Final/pkg/apperror"
	"github.com/mxilia/CEE-Final/pkg/responses"
	"gorm.io/gorm"
)

type HttpScoreHistoryHandler struct {
	db *gorm.DB
}

func NewHttpScoreHistoryHandler(db *gorm.DB) *HttpScoreHistoryHandler {
	return &HttpScoreHistoryHandler{db: db}
}

func (h *HttpScoreHistoryHandler) GetScoreHistoryByUserID(c *fiber.Ctx) error {

	userID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return responses.Error(c, appError.ErrInvalidData)
	}
	//sixMonthsAgo := time.Now().AddDate(0, -6, 0)
	var scoreHistories []entities.ScoreHistory
	if err := h.db.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&scoreHistories).Error; err != nil {
		return responses.Error(c, appError.ErrInternalServer)
	}
	return c.JSON(fiber.Map{
		"data": scoreHistories,
	})

}
