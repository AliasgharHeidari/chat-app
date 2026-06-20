package utils

import (
	"errors"

	"github.com/AliasgharHeidari/chat-app/internal/config"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID   uint   `json:"id"`
	UserUUID string `json:"user_uuid"`
	jwt.RegisteredClaims
}

func ValidateJWT(tokenString string) (*Claims, error) {
	cfg := config.AppConfig

	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(cfg.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}