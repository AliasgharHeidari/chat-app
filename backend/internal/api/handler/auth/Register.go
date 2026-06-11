package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/erros"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	service "github.com/AliasgharHeidari/chat-app/internal/service/auth"
	"github.com/gofiber/fiber/v2"
)

func Register(c *fiber.Ctx) error {
	var RegisterInput model.RegisterRequest
	err := c.BodyParser(&RegisterInput)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	err = service.Register(RegisterInput)
	if errors.Is(err, customError.InternalErr) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "internal server error, pleasy try again later",
		})
	}
	if errors.Is(err, customError.ShortUserIDErr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "user ID must have atleast 5 character",
		})
	}

	if errors.Is(err, customError.ShortPasswordErr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "password must have atleast 8 character",
		})
	}

	if errors.Is(err, customError.TooLongBioErr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Bio can not contain more than 1000 character",
		})
	}

	if errors.Is(err, customError.UserIDAlreadyExistErr) {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "this ID is already used by another account",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "account has been created successfully",
	})
}
