package main

import (
	"fmt"

	"github.com/AliasgharHeidari/chat-app/internal/api/server"
	"github.com/AliasgharHeidari/chat-app/internal/config"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
)

func main() {
	fmt.Println("starting server")

	config.LoadConfig()
	postgres.ConnectDB()
	postgres.AutoMigrate()
	server.Start()
}
