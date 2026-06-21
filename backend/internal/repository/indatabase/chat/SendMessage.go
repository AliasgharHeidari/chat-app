package indatabase

import (
	"time"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
)

func SendMessage(message *model.Message) error {

	db := postgres.GetDB()

	res := db.Create(message)
	if res.Error != nil {
		return customError.InternalErr
	}

	return nil

}

func UpdateChatTimestamp(chatID uint) error {
	db := postgres.GetDB()

	res := db.Model(&model.Chat{}).Where("id = ?", chatID).Update("updated_at", time.Now())
	if res.Error != nil {
		return customError.InternalErr
	}

	return nil
}