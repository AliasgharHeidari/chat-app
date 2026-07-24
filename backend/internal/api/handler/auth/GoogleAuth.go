package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	auth "github.com/AliasgharHeidari/chat-app/internal/service/auth"
	"github.com/gofiber/fiber/v2"
)

type GoogleAuthRequest struct {
	IDToken string `json:"id_token" validate:"required"`
}

// GoogleLogin هندلر لاگین با گوگل
func GoogleLogin(c *fiber.Ctx) error {
	var req GoogleAuthRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if req.IDToken == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id_token is required",
		})
	}

	service := &auth.GoogleAuthService{}
	user, token, err := service.HandleGoogleLogin(req.IDToken)

	if errors.Is(err, customError.InvalidCredenntialsErr) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid Google token",
		})
	}

	if errors.Is(err, customError.InternalErr) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "internal server error, please try again later",
		})
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"user":  user,
		"token": token,
	})
}