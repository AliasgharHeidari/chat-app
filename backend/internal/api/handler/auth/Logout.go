package handler

import (
	"github.com/gofiber/fiber/v2"
)

func Logout(c *fiber.Ctx) error {
	cookie := &fiber.Cookie{
		Name:     "auth_token",
		Value:    "",
		HTTPOnly: true,
		Secure:   false, // توی production: true
		SameSite: "Strict",
		Path:     "/",
		MaxAge:   -1, // 👈 این کوکی رو منقضی می‌کنه
	}
	c.Cookie(cookie)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "logged out successfully",
	})
}