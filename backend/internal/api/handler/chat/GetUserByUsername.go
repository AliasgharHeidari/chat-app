package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/erros"
	service "github.com/AliasgharHeidari/chat-app/internal/service/chat"
	"github.com/gofiber/fiber/v2"
)

func GetUserByUsername(c *fiber.Ctx) error {

	username := c.Params("username")

	currentUserID := c.Locals("id").(uint)
	_ = currentUserID

	user, err := service.GetUserByUsername(username)
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

	return c.Status(200).JSON(fiber.Map{
		"user" : user,
	})

}
