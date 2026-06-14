package service

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/erros"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/profile"
)

func GetProfile(userID uint) (model.User, error) {

	user, err := indatabase.GetProfile(userID)
	if errors.Is(err, customError.InternalErr) {
		return model.User{}, customError.InternalErr
	}

	user.PasswordHash = "" 

	return user, nil
}
