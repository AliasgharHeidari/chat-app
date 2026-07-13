package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	auth "github.com/AliasgharHeidari/chat-app/internal/service/auth"
	"github.com/gofiber/fiber/v2"
)

// ResendVerification ارسال مجدد کد تایید
func ResendVerification(c *fiber.Ctx) error {
	var req model.ResendVerificationRequest
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

	service := &auth.EmailVerificationService{}
	err := service.ResendVerificationEmail(req.Email)

	if errors.Is(err, customError.InternalErr) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "internal server error, please try again later",
		})
	}

	if errors.Is(err, customError.UserNotFoundErr) {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "user not found with this email",
		})
	}

	if errors.Is(err, customError.EmailAlreadyVerifiedErr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "email already verified",
		})
	}

	if errors.Is(err, customError.EmailSendErr) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to send verification email, please try again later",
		})
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "verification email sent successfully",
	})
}