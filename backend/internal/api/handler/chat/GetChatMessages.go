package handler

import (
	"errors"
	"strconv"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	service "github.com/AliasgharHeidari/chat-app/internal/service/chat"
	"github.com/gofiber/fiber/v2"
)

func GetChatMessages(c *fiber.Ctx) error {
	currnetUserID := c.Locals("id").(uint)

	chatID, err := strconv.ParseUint(c.Params("chat_id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid chat ID",
		})
	}

	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	offset, _ := strconv.Atoi(c.Query("offset", "0"))

	if limit > 100 {
		limit = 100
	}

	messages, err := service.GetChatMessages(uint(chatID), currnetUserID, limit, offset)
	if err != nil {
		if errors.Is(err, customError.AccessDeniedErr) {
			return c.Status(401).JSON(fiber.Map{
				"error": "access denied error",
			})
		}
		if errors.Is(err, customError.NotFoundErr) {
			return c.Status(404).JSON(fiber.Map{
				"error": "could not find chat",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "internal server error",
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"messages": messages,
		"count":    len(messages),
		"limit":    limit,
		"offset":   offset,
	})
}
