package handler

import (
	chat "github.com/AliasgharHeidari/chat-app/internal/service/chat"
	"github.com/gofiber/fiber/v2"
)

type LinkPreviewRequest struct {
	URL string `json:"url" binding:"required"`
}

// GetLinkPreview دریافت پیش‌نمایش لینک
func GetLinkPreview(c *fiber.Ctx) error {
	var req LinkPreviewRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if req.URL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "URL is required",
		})
	}

	service := chat.NewLinkPreviewService()
	preview, err := service.ExtractLinkPreview(req.URL)

	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"preview": preview,
	})
}