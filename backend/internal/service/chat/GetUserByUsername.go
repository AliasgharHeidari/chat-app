package service

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
)

func GetUserByUsername(username string) (*model.SearchUsersResponse, error) {
	if len(username) < 5 {
		return nil, nil
	}

	user, err := indatabase.GetUserByUsername(username)
	if errors.Is(err, customError.NotFoundErr) {
		return nil, customError.NotFoundErr
	}
	if errors.Is(err, customError.InternalErr) {
		return nil, customError.InternalErr
	}

	return user, nil

}
