package service

import (
	"errors"
	"time"

	"github.com/AliasgharHeidari/chat-app/internal/config"
	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/auth"
	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

func Login(input model.LoginRequest) (string, error) {
	if len(input.Password) < 8 {
		return "", customError.ShortPasswordErr
	}

	user, err := indatabase.CheckIfUserExist(input)
	if errors.Is(err, customError.InvalidCredenntialsErr) {
		return "", customError.InvalidCredenntialsErr
	}
	if errors.Is(err, customError.InternalErr) {
		return "", customError.InternalErr
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password))
	if err != nil {
		return "", customError.InvalidCredenntialsErr
	}

	cfg := config.AppConfig

	claims := jwt.MapClaims{
		"id":  float64(user.ID),
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	t, err := token.SignedString([]byte(cfg.JWTSecret))


	if err != nil {
		return "", customError.InternalErr
	}

	return t, nil

}
