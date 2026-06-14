package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/erros"
	service "github.com/AliasgharHeidari/chat-app/internal/service/profile"
	"github.com/gofiber/fiber/v2"
)

func GetProfile(c *fiber.Ctx) error {

	userID := c.Locals("id").(uint)

	user, err := service.GetProfile(userID)
	if errors.Is(err, customError.InternalErr) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "internal server error, please try again later",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"user": user,
	})

}
