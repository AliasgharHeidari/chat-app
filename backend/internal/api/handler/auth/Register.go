package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
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
			"error": "internal server error, please try again later",
		})
	}
	
	if errors.Is(err, customError.ShortUsernameErr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "username must have at least 5 characters",
		})
	}

	if errors.Is(err, customError.EmailRequiredErr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "email is required",
		})
	}
	
	if errors.Is(err, customError.InvalidEmailErr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "please enter a valid email address",
		})
	}
	
	if errors.Is(err, customError.EmailAlreadyExistErr) {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "this email is already registered",
		})
	}

	if errors.Is(err, customError.ShortPasswordErr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "password must have at least 8 characters",
		})
	}

	if errors.Is(err, customError.TooLongBioErr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "bio cannot contain more than 1000 characters",
		})
	}

	if errors.Is(err, customError.UsernameAlreadyExistErr) {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "this username is already taken",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "account has been created successfully",
	})
}