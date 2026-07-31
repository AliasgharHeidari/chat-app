package postgres

import (
	"fmt"
	"log"

	"github.com/AliasgharHeidari/chat-app/internal/config"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDB() {
	cfg := config.AppConfig

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Tehran",
		cfg.DBHost, cfg.DBUser, cfg.DBPass, cfg.DBName, cfg.DBPort,
	)

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("failed to connect to database:", err)
	}

	log.Println("database connected successfully")
}

func AutoMigrate() {
	if err := DB.AutoMigrate(
		&model.Chat{},
		&model.User{},
		&model.Message{},
		&model.CachedLinkPreview{},
	); err != nil {
		log.Fatal("failed to migrate database:", err)
	}
	log.Println("Database migration compelete")

}

func GetDB() *gorm.DB {
	return DB
}
