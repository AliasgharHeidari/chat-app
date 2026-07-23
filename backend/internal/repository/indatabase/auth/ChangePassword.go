package indatabase

import (
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
)

// UpdatePassword به‌روزرسانی پسورد کاربر
func UpdatePassword(userID uint, hashedPassword string) error {
	return postgres.DB.Model(&model.User{}).
		Where("id = ?", userID).
		Update("password_hash", hashedPassword).Error
}