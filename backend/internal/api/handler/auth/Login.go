package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/erros"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	service "github.com/AliasgharHeidari/chat-app/internal/service/auth"
	"github.com/gofiber/fiber/v2"
)

func Login(c *fiber.Ctx) error {
	var input model.LoginRequest
	err := c.BodyParser(&input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	token, err := service.Login(input)
	if errors.Is(err, customError.InternalErr) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "unexpected error, please try again in a while",
		})
	}
		if errors.Is(err, customError.ShortPasswordErr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "password must be atleast 8 charecters",
		})
	}
		if errors.Is(err, customError.InvalidCredenntialsErr) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid username or password",
		})
	}

	return c.Status(fiber.StatusAccepted).JSON(fiber.Map{
		"token" : token,
	})

}
