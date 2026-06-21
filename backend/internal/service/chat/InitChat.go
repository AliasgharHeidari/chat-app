package service

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
)

func InitChat(currentUserID uint, TargetUsername string) (*model.Chat, error) {

	targetUser, err := indatabase.FindUserByUsername(TargetUsername)
	if err != nil {
		if errors.Is(err, customError.NotFoundErr) {
			return nil, customError.NotFoundErr
		}
		return nil, customError.InternalErr
	}

	if currentUserID == targetUser.ID {
		return nil, customError.CanNotChatWithYourselfErr
	}

	existingChat, err := indatabase.FindPrivateChat(currentUserID, targetUser.ID)

	if existingChat != nil {
		return existingChat, nil
	}

	newChat := &model.Chat{
		User1ID: currentUserID,
		User2ID: targetUser.ID,
	}

	if err := indatabase.CreateChat(newChat); err != nil {
		return nil, customError.InternalErr
	}

	return indatabase.FindPrivateChat(currentUserID, targetUser.ID)
}
