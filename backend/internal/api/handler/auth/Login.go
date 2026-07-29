// backend/internal/api/handler/auth/Login.go
package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	authService "github.com/AliasgharHeidari/chat-app/internal/service/auth"
	service "github.com/AliasgharHeidari/chat-app/internal/service/chat"
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

	token, err := authService.Login(input)

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

	if err != nil && err.Error() == "please verify your email before logging in" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "please verify your email before logging in",
			"code":  "EMAIL_NOT_VERIFIED",
			"email": input.Username,
		})
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// 🔥 دریافت اطلاعات کاربر
	user, err := service.GetUserByUsername(input.Username)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "internal server error",
		})
	}
	if user == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "user not found",
		})
	}

	// 🔥 تنظیم کوکی HttpOnly
	cookie := &fiber.Cookie{
		Name:     "auth_token",
		Value:    token,
		HTTPOnly: true,
		Secure:   false, // توی production: true
		SameSite: "Strict",
		MaxAge:   24 * 60 * 60,
		Path:     "/",
	}
	c.Cookie(cookie)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "login successful",
		"user":    user,
	})
}
