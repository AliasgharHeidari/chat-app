package security

import (
	"github.com/gofiber/fiber/v2"
	"os"
)

func CSP() fiber.Handler {
	isDev := os.Getenv(".env") != "production"
	connectSrc := "'self' wss://literallyme.ir"
	if isDev {
		connectSrc += " ws://localhost:3000"
	}
	policy := "default-src 'self'; " +
		"script-src 'self' https://accounts.google.com; " +
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
		"img-src 'self' data: https:; " +
		"font-src 'self' https://fonts.gstatic.com; " +
		"connect-src " + connectSrc + "; " +
		"frame-src https://accounts.google.com; " +
		"object-src 'none'; " +
		"base-uri 'self'; " +
		"form-action 'self'; " +
		"upgrade-insecure-requests"
	return func(c *fiber.Ctx) error {
		c.Set("Content-Security-Policy", policy)
		return c.Next()
	}
}
