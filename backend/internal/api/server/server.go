package server

import (
	"time"

	authHandler "github.com/AliasgharHeidari/chat-app/internal/api/handler/auth"
	handler "github.com/AliasgharHeidari/chat-app/internal/api/handler/chat"
	profileHandler "github.com/AliasgharHeidari/chat-app/internal/api/handler/profile"
	Websocket "github.com/AliasgharHeidari/chat-app/internal/api/handler/websocket"
	middleware "github.com/AliasgharHeidari/chat-app/internal/api/middleware/auth"
	rateLimiter "github.com/AliasgharHeidari/chat-app/internal/api/middleware/rateLimiter"
	"github.com/AliasgharHeidari/chat-app/internal/api/middleware/security"
	"github.com/AliasgharHeidari/chat-app/internal/config"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func Start() {
	cfg := config.AppConfig
	app := fiber.New(fiber.Config{
		// Return structured errors
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// ─────────────────────────────────────────
	// Global Middleware
	// ─────────────────────────────────────────
	app.Use(security.CSP())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173,https://localhost:5173",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowCredentials: true,
	}))
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path}\n",
	}))

	// ─────────────────────────────────────────
	// Build limiters ONCE (per-IP internally)
	// ─────────────────────────────────────────
	authLimiter := rateLimiter.AuthLimiter() 
	registerLimiter := rateLimiter.RegisterLimiter()
	googleLimiter := rateLimiter.GoogleAuthLimiter()
	searchLimiter := rateLimiter.SearchLimiter()
	messageLimiter := rateLimiter.MessageLimiter()
	chatInitLimiter := rateLimiter.ChatInitLimiter()
	generalLimiter := rateLimiter.GeneralLimiter()

	strictLoginLimiter := rateLimiter.NewLockoutLimiter(rateLimiter.LockoutConfig{
		MaxRequests:     10,
		LockoutDuration: 5 * time.Minute,
	}).Middleware()

	// ─────────────────────────────────────────
	// Auth Routes (public)
	// ─────────────────────────────────────────
	authGroup := app.Group("/auth")

	authGroup.Post("/register", registerLimiter, authHandler.Register)
	authGroup.Post("/login" ,authLimiter, strictLoginLimiter, authHandler.Login)
	authGroup.Post("/google", googleLimiter, authHandler.GoogleLogin)
	authGroup.Post("/logout", authHandler.Logout)
	authGroup.Post("/verify-email", authHandler.VerifyEmail)
	authGroup.Post("/resend-verification", authHandler.ResendVerification)

	// ─────────────────────────────────────────
	// WebSocket
	// ─────────────────────────────────────────
	app.Get("/ws/chat", Websocket.WebSocketHandler)

	// ─────────────────────────────────────────
	// Protected Routes
	// ─────────────────────────────────────────
	protected := app.Group("/chat",
		middleware.Protected, // JWT check first
		generalLimiter,       // then general rate limit
	)

	// Profile
	protected.Get("/me", profileHandler.GetProfile)
	protected.Put("/me", profileHandler.ModifyProfile)
	protected.Put("/change-password", authHandler.ChangePassword)

	// Users
	protected.Get("/users/search", searchLimiter, handler.SearchUsers)
	protected.Get("/users/:username", handler.GetUserByUsername)

	// Chats
	protected.Post("/chats/init", chatInitLimiter, handler.InitChat)
	protected.Get("/chats", handler.GetAllChats)
	protected.Get("/chats/:chat_id", handler.GetChatByChatID)
	protected.Get("/chats/:chat_id/messages", handler.GetChatMessages)

	// Messages
	protected.Post("/messages", messageLimiter, handler.SendMessage)
	protected.Put("/messages/:message_id", handler.ModifyMessage)
	protected.Delete("/messages/:message_id", handler.DeleteMessage)

	// Utilities
	protected.Post("/link-preview", handler.GetLinkPreview)

	app.Listen(cfg.Host + cfg.Port)
}
