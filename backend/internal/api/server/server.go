package server

import (
	authHandler "github.com/AliasgharHeidari/chat-app/internal/api/handler/auth"
	handler "github.com/AliasgharHeidari/chat-app/internal/api/handler/chat"
	profileHandler "github.com/AliasgharHeidari/chat-app/internal/api/handler/profile"
	middleware "github.com/AliasgharHeidari/chat-app/internal/api/middleware/auth"
	"github.com/AliasgharHeidari/chat-app/internal/config"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func Start() {
	cfg := config.AppConfig
	app := fiber.New()

	app.Use(cors.New())

	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path}\n",
	}))
	api := app.Group("/auth")
	api.Post("/register", authHandler.Register)
	api.Post("/login", authHandler.Login)

	protected := app.Group("/chat", middleware.Protected)
	protected.Get("/me", profileHandler.GetProfile)
	protected.Put("/me",profileHandler.ModifyProfile)
	protected.Get("/users/search", handler.SearchUsers)
	/*

		protected.Get("/users/:user_id")

		protected.Post("/chats/init")
		protected.Get("/chats")
		protected.Get("/chats/:chat_id")
		protected.Get("/chats/:chat_id/messages")

		protected.Post("/messages")
		protected.Put("/messages/:message_id")
		protected.Delete("/messages/:message_id")

		app.Get("/ws/chat") */
	app.Listen(cfg.Port)
}
