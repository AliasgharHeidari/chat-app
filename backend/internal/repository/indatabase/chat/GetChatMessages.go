package indatabase

import (
	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
)

func GetChatMessages(chatID uint, currentUserID uint, limit, offset int) ([]model.Message, error) {

	db := postgres.GetDB()
	var messages []model.Message

	res := db.
		Preload("Sender").
		Select("id, chat_id, sender_id, message_text, status, is_edited, is_deleted, deleted_for, seen_at, created_at, updated_at").
		Where("chat_id = ? AND is_deleted = ? AND (deleted_for IS NULL OR deleted_for != ?)", chatID, false, currentUserID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&messages)

	if res.Error != nil {
		return nil, customError.InternalErr
	}

	return messages, nil
}
