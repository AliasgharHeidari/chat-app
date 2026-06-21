package indatabase

import (
	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
	"gorm.io/gorm"
)

func GetAllChats(currentUserID uint) ([]model.Chat, error) {
	db := postgres.GetDB()
	var chats []model.Chat

	res := db.
		Preload("User1").
		Preload("User2").
		Preload("Messages", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC").Limit(1)
		}).
		Where("user1_id = ? OR user2_id = ?", currentUserID, currentUserID).
		Order("created_at DESC").
		Find(&chats)

		if res.Error != nil {
			return nil, customError.InternalErr
		}

		return chats, nil
}
