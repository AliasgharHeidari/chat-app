package handler

import (
	"errors"
	"strconv"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	service "github.com/AliasgharHeidari/chat-app/internal/service/chat"
	"github.com/gofiber/fiber/v2"
)

func GetChatByChatID(c *fiber.Ctx) error {

	currentUserID := c.Locals("id").(uint)
	chatID, err := strconv.ParseUint(c.Params("chat_id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid chat ID",
		})
	}

	chat, err := service.GetChatByChatID(currentUserID, uint(chatID))

	if err != nil {
		if errors.Is(err, customError.NotFoundErr) {
			return c.Status(404).JSON(fiber.Map{
				"error": "could not find chat",
			})
		}
		if errors.Is(err, customError.AccessDeniedErr) {
			return c.Status(403).JSON(fiber.Map{
				"error": "Access denied",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "internal server error",
		})
	}

	var otherUser *model.User
	if chat.User1ID == currentUserID {
		otherUser = &chat.User2
	} else {
		otherUser = &chat.User1
	}

	return c.Status(200).JSON(fiber.Map{
		"chat": chat,
		"other_user": fiber.Map{
			"id":         otherUser.ID,
			"username":   otherUser.Username,
			"first_name": otherUser.FirstName,
			"last_name":  otherUser.LastName,
			"bio":        otherUser.Bio,
			"is_online":  otherUser.IsOnline,
			"last_seen":  otherUser.LastSeen,
		},
	})
}
