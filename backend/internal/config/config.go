package config

import (
	"log"
	"os"
	
	"github.com/joho/godotenv"
)

type Config struct {
	Port     string
	DBHost   string
	DBPort   string
	DBUser   string
	DBPass   string
	DBName   string
	JWTSecret string
}

var AppConfig *Config

func LoadConfig() {
	godotenv.Load()
	
	AppConfig = &Config{
		Port:      getEnv("PORT", "3000"),
		DBHost:    getEnv("DB_HOST", "localhost"),
		DBPort:    getEnv("DB_PORT", "5432"),
		DBUser:    getEnv("DB_USER", "postgres"),
		DBPass:    getEnv("DB_PASS", ""),
		DBName:    getEnv("DB_NAME", "chat_db"),
		JWTSecret: getEnv("JWT_SECRET", "aa"),
	}
	
	if AppConfig.JWTSecret == "" {
		log.Fatal("JWT_SECRET not set in .env file")
	}
}
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}