package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	service "github.com/AliasgharHeidari/chat-app/internal/service/chat"
	"github.com/gofiber/fiber/v2"
)

func SearchUsers(c *fiber.Ctx) error {
	currentUserID := c.Locals("id").(uint)

	query := c.Query("q")

	users, err := service.SearchUsers(query, currentUserID)
	if errors.Is(err, customError.InternalErr) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "internal server error, please try again later",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"users": users,
		"count": len(users),
	})

}
