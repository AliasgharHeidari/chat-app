package service

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
)

func DeleteMessage(messageID uint, userID uint, deleteForEveryone bool) error {

	message, err := indatabase.GetMessageByID(messageID)
	if err != nil {
		if errors.Is(err, customError.NotFoundErr) {
			return customError.NotFoundErr
		}
		return customError.InternalErr
	}

	if message.IsDeleted {
		return customError.MessageAlreadyDeletedErr
	}

	if message.SenderID != userID && deleteForEveryone {
		return customError.AccessDeniedErr
	}

	if message.SenderID != userID && !deleteForEveryone {
		return indatabase.DeleteMessageForMe(messageID, userID)
	}

	if deleteForEveryone {
		return indatabase.DeleteMessageForEveryone(messageID, userID)
	}

	return indatabase.DeleteMessageForMe(messageID, userID)

}
