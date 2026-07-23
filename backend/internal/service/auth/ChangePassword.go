package service

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	auth "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/auth"
	"golang.org/x/crypto/bcrypt"
)

type ChangePasswordService struct{}

// ChangePassword تغییر پسورد کاربر
func (s *ChangePasswordService) ChangePassword(userID uint, req model.ChangePasswordRequest) error {
	// ۱. پیدا کردن کاربر
	user, err := auth.GetUserByID(userID)
	if err != nil {
		return customError.InternalErr
	}
	if user == nil {
		return customError.UserNotFoundErr
	}

	// ۲. اگر کاربر با گوگل ثبت‌نام کرده و پسورد نداره
	if user.PasswordHash == "" {
		return errors.New("you logged in with Google, please use Google to login")
	}

	// ۳. بررسی پسورد فعلی
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword))
	if err != nil {
		return customError.InvalidCredenntialsErr
	}

	// ۴. هش کردن پسورد جدید
	hashedPassword, err := HashPassword(req.NewPassword)
	if err != nil {
		return customError.InternalErr
	}

	// ۵. ذخیره پسورد جدید
	if err := auth.UpdatePassword(userID, hashedPassword); err != nil {
		return customError.InternalErr
	}

	return nil
}

// GetUserByID پیدا کردن کاربر با ID
func GetUserByID(userID uint) (*model.User, error) {
	return auth.GetUserByID(userID)
}