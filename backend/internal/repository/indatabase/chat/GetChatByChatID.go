package indatabase

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
	"gorm.io/gorm"
)

func GetChatByChatID(currentUserID uint, chatID uint) (*model.Chat, error) {

	db := postgres.GetDB()
	var chat model.Chat

	res := db.
		Preload("User1").
		Preload("User2").
		First(&chat, chatID)

	if res.Error != nil {
		if errors.Is(res.Error, gorm.ErrRecordNotFound) {
			return nil, customError.NotFoundErr
		}
		return nil, customError.InternalErr
	}

	return &chat, nil

}
