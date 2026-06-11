package service

import (
	"errors"
	"log"

	customError "github.com/AliasgharHeidari/chat-app/internal/erros"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/auth"
	"golang.org/x/crypto/bcrypt"
)

func Register(input model.RegisterRequest) error {
	if len(input.UserID) < 5 {
		return customError.ShortUserIDErr
	}

	if len(input.Password) < 8 {
		return customError.ShortPasswordErr
	}

	if len(input.Bio) > 1000 {
		return customError.TooLongBioErr
	}

	err := indatabase.CheckAvailability(input)
	if errors.Is(err, customError.UserIDAlreadyExistErr) {
		return customError.UserIDAlreadyExistErr
	}

	hashedPassword, err := HashPassword(input.Password)
	if err != nil {
		return customError.InternalErr
	}

	err = indatabase.Register(input, hashedPassword)
	if err != nil {
		return customError.InternalErr
	}

	return nil
}

func HashPassword(pass string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(pass), 10)
	if err != nil {
		log.Println("error whle password hashinh, ", err)
	}

	return string(hashedPassword), nil

}
