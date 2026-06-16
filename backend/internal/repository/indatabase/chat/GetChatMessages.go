package indatabase

import (
	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
)

func GetChatMessages(chatID uint, limit, offset int) ([]model.Message, error) {

	db := postgres.GetDB()
	var messages []model.Message

	res := db.
	Preload("Sender").
	Where("chat_id = ? AND is_deleted = ?", chatID, false).
	Limit(limit).
	Offset(offset).
	Find(&messages)

	if res.Error != nil {
		return nil, customError.InternalErr
	}

	return messages, nil

}