package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	service "github.com/AliasgharHeidari/chat-app/internal/service/chat"
	"github.com/gofiber/fiber/v2"
)

func SendMessage(c *fiber.Ctx) error {

	senderID := c.Locals("id").(uint)
	var req model.SendMessageRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.ChatID == 0 {
		return c.Status(400).JSON(fiber.Map{
			"error": "chat_id is required",
		})
	}

	if req.MessageText == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "message_text is required",
		})
	}

	if len(req.MessageText) > 1000 {
		return c.Status(400).JSON(fiber.Map{
			"error": "messages must be less than 1000 characters",
		})
	}

	message, err := service.SendMessage(req.ChatID, senderID, req.MessageText)
	if err != nil {
		if errors.Is(err, customError.AccessDeniedErr) {
			return c.Status(401).JSON(fiber.Map{
				"error": "access denied error",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "internal server error",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"message": "Message sent successfully",
		"data":    message,
	})

}
