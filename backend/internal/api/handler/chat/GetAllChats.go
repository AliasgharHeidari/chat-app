package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	service "github.com/AliasgharHeidari/chat-app/internal/service/chat"
	"github.com/gofiber/fiber/v2"
)

func GetAllChats(c *fiber.Ctx) error {

	CurrentUserID := c.Locals("id").(uint)

	chats, err := service.GetAllChats(CurrentUserID)
	if errors.Is(err, customError.InternalErr) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "internal server error",
		})
	}

	if len(chats) == 0 {
		return c.Status(200).JSON(fiber.Map{
			"chats" : []interface{}{},
			"count": 0, 
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"chats" : chats,
		"count" : len(chats),
	})
}
