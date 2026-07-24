package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	auth "github.com/AliasgharHeidari/chat-app/internal/service/auth"
	"github.com/gofiber/fiber/v2"
)

// VerifyEmail تایید ایمیل با کد
func VerifyEmail(c *fiber.Ctx) error {
	var req model.VerifyEmailRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	// اعتبارسنجی ورودی
	if req.Email == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "email is required",
		})
	}
	if req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "verification code is required",
		})
	}

	service := &auth.EmailVerificationService{}
	err := service.VerifyEmail(req.Email, req.Code)

	if errors.Is(err, customError.InternalErr) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "internal server error, please try again later",
		})
	}

	if errors.Is(err, customError.InvalidVerificationCodeErr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid verification code",
		})
	}

	if errors.Is(err, customError.VerificationCodeExpiredErr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "verification code expired, please request a new one",
		})
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "email verified successfully",
	})
}