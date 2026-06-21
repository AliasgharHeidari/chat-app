package service

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
)

func GetChatByChatID(currentUserID uint, chatID uint) (*model.Chat, error) {
	chat, err := indatabase.GetChatByChatID(currentUserID, chatID) 
	if err != nil  {
		if errors.Is(err, customError.NotFoundErr) {
			return nil, customError.NotFoundErr
		}
		return nil, customError.InternalErr
	}	

	if chat.User1ID != currentUserID && chat.User2ID != currentUserID {
		return nil, customError.AccessDeniedErr
	}

	return chat, nil

}