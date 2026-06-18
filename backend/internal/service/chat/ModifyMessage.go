package service

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
)

func ModifyMessage(userID uint, NewText string, messageID uint) (*model.Message, error) {

	message, err := indatabase.GetMessageByID(messageID)
	if err != nil {
		if errors.Is(err, customError.NotFoundErr) {
			return nil, customError.NotFoundErr
		}
		return nil, customError.InternalErr
	}

	if message.SenderID != userID {
		return nil, customError.AccessDeniedErr
	}

	if message.IsDeleted {
		return nil, customError.MessageDeletedErr
	}

	err = indatabase.ModifyMessage(messageID, NewText)
	if err != nil {
		if errors.Is(err, customError.InternalErr) {
			return nil, customError.InternalErr
		}
		return nil, customError.MessageNotFoundErr

	}

	updatedMessage, err := indatabase.GetMessageByID(messageID)
	if err != nil {
		if errors.Is(err, customError.NotFoundErr) {
			return nil, customError.NotFoundErr
		}
		return nil, customError.InternalErr
	}

	return updatedMessage, nil
}
