package indatabase

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
	"gorm.io/gorm"
)

// CheckAvailability بررسی وجود کاربر با یوزرنیم
func CheckAvailability(input model.RegisterRequest) error {
	var user model.User
	err := postgres.DB.Where("username = ?", input.Username).First(&user).Error
	if err == nil {
		return customError.UsernameAlreadyExistErr
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	return nil
}

// 🔥 جدید - GetUserByEmail پیدا کردن کاربر با ایمیل
func GetUserByEmail(email string) (*model.User, error) {
	var user model.User
	err := postgres.DB.Where("email = ?", email).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// Register ثبت‌نام کاربر جدید
func Register(input model.RegisterRequest, hashedPassword string) error {
	user := model.User{
		Username:     input.Username,
		FirstName:    input.FirstName,
		LastName:     input.LastName,
		Email:        input.Email,
		Bio:          input.Bio,
		PasswordHash: hashedPassword,
	}
	return postgres.DB.Create(&user).Error
}

// GetUserByUsernameForRegister چک کردن تکراری بودن یوزرنیم (برای کاربران گوگل)
func GetUserByUsernameForRegister(username string) (*model.User, error) {
	var user model.User
	err := postgres.DB.Where("username = ?", username).First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}