package service

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
)

func GetUserByUsername(username string) (*model.SearchUsersResponse, error) {
	user, err := indatabase.GetUserByUsernameForSearch(username)
	if errors.Is(err, customError.NotFoundErr) {
		return nil, customError.NotFoundErr
	}
	if err != nil {
		return nil, customError.InternalErr
	}
	return user, nil
}
