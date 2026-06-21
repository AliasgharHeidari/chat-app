package handler

import (
	"strconv"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	service "github.com/AliasgharHeidari/chat-app/internal/service/chat"
	"github.com/gofiber/fiber/v2"
)

func DeleteMessage(c *fiber.Ctx) error {
	userID := c.Locals("id").(uint)

	var input model.DeleteMessageRequest

	err := c.BodyParser(&input)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	messageID, err := strconv.ParseUint(c.Params("message_id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid message ID",
		})
	}

	err = service.DeleteMessage(uint(messageID), userID, input.DeleteForEveryone)
	if err != nil {
		if err == customError.MessageNotFoundErr {
			return c.Status(404).JSON(fiber.Map{
				"error": "Message not found",
			})
		}
		if err == customError.AccessDeniedErr {
			return c.Status(403).JSON(fiber.Map{
				"error": "You can only delete your own messages for everyone",
			})
		}
		if err == customError.MessageAlreadyDeletedErr {
			return c.Status(400).JSON(fiber.Map{
				"error": "Message already deleted",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "internal server error",
		})
	}

	    message := "Message deleted successfully"
    if input.DeleteForEveryone {
        message = "Message deleted for everyone"
    }

    return c.Status(200).JSON(fiber.Map{
        "message": message,
        "data": fiber.Map{
            "message_id": messageID,
            "deleted_for_everyone": input.DeleteForEveryone,
        },
    })
}

