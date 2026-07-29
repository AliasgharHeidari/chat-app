package middleware

import (
	"errors"
	"strings"

	"github.com/AliasgharHeidari/chat-app/internal/config"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt"
)

func Protected(c *fiber.Ctx) error {
	var tokenString string

	// 🔥 1. اول از کوکی بخون
	cookieToken := c.Cookies("auth_token")
	if cookieToken != "" {
		tokenString = cookieToken
	} else {
		// 🔥 2. اگه توی کوکی نبود، از هدر Authorization بخون (برای backward compatibility)
		authHeader := c.Get("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				tokenString = parts[1]
			}
		}
	}

	// 🔥 3. اگه هیچ توکنی پیدا نشد
	if tokenString == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "unauthorized attempt",
		})
	}

	cfg := config.AppConfig

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}
		return []byte(cfg.JWTSecret), nil
	})

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid or expired token",
		})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid token claims",
		})
	}

	// 🔥 4. ذخیره ID کاربر در context
	c.Locals("id", uint(claims["id"].(float64)))
	return c.Next()
}