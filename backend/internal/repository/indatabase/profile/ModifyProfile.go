package indatabase

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
	"gorm.io/gorm"
)

func ModifyProfile(updates map[string]interface{}, userID uint) error {
	db := postgres.GetDB()
	tx := db.Begin()

	res := tx.Model(&model.User{}).Where("id = ?", userID).Updates(updates)
	if res.Error != nil {
		tx.Rollback()
		return customError.InternalErr
	}

	err := tx.Commit().Error
	if err != nil {
		return customError.InternalErr
	}
	return nil

}

func CheckIfUsernameIsAvailable(username string, UserID uint) error {
	db := postgres.GetDB()
	var user model.User
	res := db.Where("username = ? AND id != ?", username, UserID).First(&user)
	if errors.Is(res.Error, gorm.ErrRecordNotFound) {
		return nil
	}
	return customError.UsernameAlreadyExistErr
}
