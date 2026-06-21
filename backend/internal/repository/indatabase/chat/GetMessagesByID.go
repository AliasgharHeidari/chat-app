package indatabase

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
	"gorm.io/gorm"
)

func GetMessageByID(messageID uint) (*model.Message, error) {
	db := postgres.GetDB()
	var message model.Message

	result := db.
		Preload("Sender").
		First(&message, messageID)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, customError.NotFoundErr
		}
		return nil, customError.InternalErr
	}

	return &message, nil
}
