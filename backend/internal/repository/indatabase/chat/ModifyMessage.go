package indatabase

import (
	"time"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
)

func ModifyMessage(messageID uint, newText string) error {
	db := postgres.GetDB()

	now := time.Now()
	updates := map[string]interface{}{
		"message_text": newText,
		"is_edited":    true,
		"edited_at":    now,
	}

	res := db.Model(&model.Message{}).Where("id = ?", messageID).Updates(updates)

	if res.Error != nil {
		return customError.InternalErr
	}

	if res.RowsAffected == 0 {
		return customError.MessageNotFoundErr
	}

	return nil

}
