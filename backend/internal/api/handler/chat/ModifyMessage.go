package handler

import (
	"strconv"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	service "github.com/AliasgharHeidari/chat-app/internal/service/chat"
	"github.com/gofiber/fiber/v2"
)

func ModifyMessage(c *fiber.Ctx) error {
	userID := c.Locals("id").(uint)

	messageID, err := strconv.ParseUint(c.Params("message_id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid message ID",
		})
	}

	var input model.EditMessageRequest
	err = c.BodyParser(&input)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if input.NewText == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "new_text is required",
		})
	}

	if len(input.NewText) > 1000 {
		return c.Status(400).JSON(fiber.Map{
			"error": "new_text must be less than 1000 characters",
		})
	}

	updatedMessage, err := service.ModifyMessage(userID, input.NewText, uint(messageID))
	if err != nil {
		if err == customError.MessageNotFoundErr {
			return c.Status(404).JSON(fiber.Map{
				"error": "Message not found",
			})
		}
		if err == customError.AccessDeniedErr {
			return c.Status(403).JSON(fiber.Map{
				"error": "You can only edit your own messages",
			})
		}
		if err == customError.MessageDeletedErr {
			return c.Status(400).JSON(fiber.Map{
				"error": "Cannot edit a deleted message",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "internal server error",
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "Message edited successfully",
		"data":    updatedMessage,
	})
}
