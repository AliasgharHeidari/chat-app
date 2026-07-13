package indatabase

import (
	"errors"

	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
	"gorm.io/gorm"
)

func GetUserByGoogleID(googleID string) (*model.User, error) {
	var user model.User
	db := postgres.GetDB()
	err := db.Where("google_id = ?", googleID).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}


func CreateUserWithGoogle(user *model.User) error {
	db := postgres.GetDB()
	return db.Create(user).Error
}


func UpdateUserGoogleID(userID uint, googleID string) error {
	return postgres.DB.Model(&model.User{}).
		Where("id = ?", userID).
		Update("google_id", googleID).Error
}