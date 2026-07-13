package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
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
			"error": "password must be at least 8 characters",
		})
	}
	
	if errors.Is(err, customError.InvalidCredenntialsErr) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid username or password",
		})
	}

	// 🔥 جدید - خطای تایید ایمیل
	if err != nil && err.Error() == "please verify your email before logging in" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error":  "please verify your email before logging in",
			"code":   "EMAIL_NOT_VERIFIED",
			"email":  input.Username, // یا ایمیل کاربر رو برگردون
		})
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusAccepted).JSON(fiber.Map{
		"token": token,
	})
}