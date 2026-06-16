package service

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
)

func GetChatMessages(chatID uint, currentUserID uint, limit, offset int) ([]model.Message, error) {

	chat, err := indatabase.GetChatByChatID(currentUserID, chatID)
	if err != nil {
		if errors.Is(err, customError.NotFoundErr) {
			return nil, customError.NotFoundErr
		}
		return nil, customError.InternalErr
	}

	if chat.User1ID != currentUserID && chat.User2ID != currentUserID {
		return nil, customError.AccessDeniedErr
	}

	messages, err := indatabase.GetChatMessages(chatID, limit, offset)
	if err != nil {
		return nil, customError.InternalErr
	}

	return messages, nil

}
