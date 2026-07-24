package indatabase

import (
	"errors"
	"time"

	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
	"gorm.io/gorm"
)

// SaveVerificationToken ذخیره توکن تایید برای کاربر
func SaveVerificationToken(userID uint, token string, expiry time.Time) error {
	return postgres.DB.Model(&model.User{}).
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"verify_token":  token,
			"verify_expiry": expiry,
		}).Error
}

// GetUserByEmailAndToken پیدا کردن کاربر با ایمیل و توکن
func GetUserByEmailAndToken(email, token string) (*model.User, error) {
	var user model.User
	err := postgres.DB.Where("email = ? AND verify_token = ?", email, token).
		First(&user).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// VerifyUserEmail تایید ایمیل کاربر
func VerifyUserEmail(userID uint) error {
	return postgres.DB.Model(&model.User{}).
		Where("id = ?", userID).
		Updates(map[string]interface{}{
			"email_verified": true,
			"verify_token":   "",
			"verify_expiry":  nil,
		}).Error
}

// GetUserByEmailForVerification پیدا کردن کاربر با ایمیل (برای ارسال مجدد)
func GetUserByEmailForVerification(email string) (*model.User, error) {
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