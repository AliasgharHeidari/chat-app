package service

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/erros"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
)

func SearchUsers(query string, currentUserID uint) ([]model.SearchUsersResponse, error) {
	if query == "" {
		return []model.SearchUsersResponse{}, nil
	}

	users, err := indatabase.SearchUsers(query, currentUserID)
	if errors.Is(err, customError.InternalErr) {
		return nil, customError.InternalErr
	}

	return users, nil
}
