package indatabase

import (
	"time"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
)

func DeleteMessageForMe(messageID uint, userID uint) error {
	db := postgres.GetDB()

	res := db.Model(&model.Message{}).Where("id = ?", messageID).Updates(map[string]interface{}{
		"deleted_for": userID,
		"updated_at":  time.Now(),
	})

	if res.Error != nil {
		return customError.InternalErr
	}

	if res.RowsAffected == 0 {
		return customError.MessageNotFoundErr
	}

	return nil
}

func DeleteMessageForEveryone(messageID uint, userID uint) error {
	db := postgres.GetDB()

	res := db.Model(&model.Message{}).Where("id = ?", messageID).Updates(map[string]interface{}{
		"is_deleted":  true,
		"deleted_for": nil,
		"updated_at":  time.Now(),
	})

	if res.Error != nil {
		return customError.InternalErr
	}

	if res.RowsAffected == 0 {
		return customError.MessageNotFoundErr
	}

	return nil

}
