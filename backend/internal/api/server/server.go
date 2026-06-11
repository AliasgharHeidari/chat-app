package server

import (
	"log"

	"github.com/AliasgharHeidari/chat-app/internal/api/handler/auth"
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
	api := app.Group("/chatapp")
	api.Post("/register", handler.Register)

	log.Println(cfg.Port)

	/* 	api.Post("/login")

	protected := api.Group("/")
	protected.Get("/me")
	protected.Put("/me")
	protected.Get("/users/search")
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
