package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	auth "github.com/AliasgharHeidari/chat-app/internal/service/auth"
	"github.com/gofiber/fiber/v2"
)

// ChangePassword تغییر پسورد کاربر
func ChangePassword(c *fiber.Ctx) error {
	// ۱. دریافت کاربر از context (از middleware JWT)
	userID, ok := c.Locals("id").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized",
		})
	}

	// ۲. پارس کردن درخواست
	var req model.ChangePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	// ۳. اعتبارسنجی ساده
	if req.CurrentPassword == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "current password is required",
		})
	}
	if len(req.NewPassword) < 8 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "new password must be at least 8 characters",
		})
	}

	// ۴. تغییر پسورد
	service := &auth.ChangePasswordService{}
	err := service.ChangePassword(userID, req)

	if errors.Is(err, customError.InternalErr) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "internal server error, please try again later",
		})
	}

	if errors.Is(err, customError.UserNotFoundErr) {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "user not found",
		})
	}

	if errors.Is(err, customError.InvalidCredenntialsErr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "current password is incorrect",
		})
	}

	if err != nil && err.Error() == "you logged in with Google, please use Google to login" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "you logged in with Google, please use Google to login",
		})
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "password changed successfully",
	})
}