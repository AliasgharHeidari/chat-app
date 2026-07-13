package config

import (
	"log"
	"os"
	
	"github.com/joho/godotenv"
)

type Config struct {
	Host     string
	Port     string
	DBHost   string
	DBPort   string
	DBUser   string
	DBPass   string
	DBName   string
	JWTSecret string
	

	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string
	

	SMTPHost     string
	SMTPPort     string
	SMTPUser     string
	SMTPPassword string
	SMTPFrom     string
	AppURL       string
}

var AppConfig *Config

func LoadConfig() {
	godotenv.Load()
	
	AppConfig = &Config{
		Host:      getEnv("HOST", "127.0.0.1"),
		Port:      getEnv("PORT", "3000"),
		DBHost:    getEnv("DB_HOST", "localhost"),
		DBPort:    getEnv("DB_PORT", "5432"),
		DBUser:    getEnv("DB_USER", "postgres"),
		DBPass:    getEnv("DB_PASS", ""),
		DBName:    getEnv("DB_NAME", "chat_db"),
		JWTSecret: getEnv("JWT_SECRET", "aa"),
		
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:  getEnv("GOOGLE_REDIRECT_URL", "http://localhost:3000/api/v1/auth/google/callback"),
		
	
		SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:     getEnv("SMTP_PORT", "587"),
		SMTPUser:     getEnv("SMTP_USER", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		SMTPFrom:     getEnv("SMTP_FROM", "noreply@chatapp.com"),
		AppURL:       getEnv("APP_URL", "http://localhost:5173"),
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