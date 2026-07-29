package indatabase

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
	"gorm.io/gorm"
)

// GetUserByUsername دریافت کاربر با یوزرنیم (برای لاگین)
func GetUserByUsername(username string) (*model.User, error) {
	db := postgres.GetDB()

	var user model.User
	err := db.Where("username = ?", username).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, customError.InternalErr
	}

	return &user, nil
}

// GetUserByUsernameForSearch دریافت کاربر با یوزرنیم (برای جستجو)
func GetUserByUsernameForSearch(username string) (*model.SearchUsersResponse, error) {
	db := postgres.GetDB()

	var user model.SearchUsersResponse
	err := db.Model(&model.User{}).
		Select("id, username, first_name, last_name, bio, profile_pic_url, is_online").
		Where("username ILIKE ?", username).
		First(&user).Error

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, customError.NotFoundErr
	}
	if err != nil {
		return nil, customError.InternalErr
	}

	return &user, nil
}

// CheckIfUserExist بررسی وجود کاربر با یوزرنیم (برای لاگین)
func CheckIfUserExist(input model.LoginRequest) (*model.User, error) {
	db := postgres.GetDB()

	var user model.User
	err := db.Where("username = ?", input.Username).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, customError.InvalidCredenntialsErr
	}
	if err != nil {
		return nil, customError.InternalErr
	}

	return &user, nil
}