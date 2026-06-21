package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	service "github.com/AliasgharHeidari/chat-app/internal/service/chat"
	"github.com/gofiber/fiber/v2"
)

func InitChat(c *fiber.Ctx) error {

	currentUserID := c.Locals("id").(uint)

	var req model.InitChatRequest

	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if req.TargetUsername == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "target_username is required",
		})
	}

	chat, err := service.InitChat(currentUserID, req.TargetUsername)
	if errors.Is(err, customError.InternalErr) {
		return c.Status(500).JSON(fiber.Map{
			"error": "internal server error",
		})
	}
	if errors.Is(err, customError.NotFoundErr) {
		return c.Status(404).JSON(fiber.Map{
			"error": "not found",
		})
	}
	if errors.Is(err, customError.CanNotChatWithYourselfErr) {
		return c.Status(404).JSON(fiber.Map{
			"error": "you can not chat with yourself",
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "Chat initiated successfully",
		"chat":    chat,
	})

}
