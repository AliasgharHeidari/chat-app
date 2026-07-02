package service

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
)

func MarkMessageAsSeen(messageID uint) error {
	err := indatabase.MarkMessageAsSeen(messageID)
	if err != nil {
		if errors.Is(err, customError.MessageNotFoundErr) {
			return customError.MessageNotFoundErr
		}
		return customError.InternalErr
	}
	return nil
}
