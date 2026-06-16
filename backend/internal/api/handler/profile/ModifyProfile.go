package handler

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	service "github.com/AliasgharHeidari/chat-app/internal/service/profile"
	"github.com/gofiber/fiber/v2"
)

func ModifyProfile(c *fiber.Ctx) error {

	id := c.Locals("id").(uint)
	var input model.UpdateProfileRequest
	err := c.BodyParser(&input)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	err = service.ModifyProfile(id, input)
	if errors.Is(err, customError.InternalErr) {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "internal server error, please try again later",
		})
	}
	if errors.Is(err, customError.UsernameAlreadyExistErr) {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "username is already taken",
		})
	}
	if errors.Is(err, customError.InvalidUsernameErr) {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "username must be 5-50 character",
		})
	}
	if errors.Is(err, customError.TooLongBioErr) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "too long bio, maximum: 1000",
		})
	}

	return c.Status(fiber.StatusAccepted).JSON(fiber.Map{
		"message": "changes were applied successfuly",
	})

}
