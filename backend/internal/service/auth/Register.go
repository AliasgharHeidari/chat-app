// backend/internal/service/auth/Register.go
package service

import (
	"errors"
	"log"
	"regexp"
	"time"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/auth"
	"golang.org/x/crypto/bcrypt"
)

func Register(input model.RegisterRequest) error {
	// اعتبارسنجی یوزرنیم
	if len(input.Username) < 5 {
		return customError.ShortUsernameErr
	}

	// اعتبارسنجی ایمیل
	if input.Email == "" {
		return customError.EmailRequiredErr
	}
	if !isValidEmail(input.Email) {
		return customError.InvalidEmailErr
	}

	// اعتبارسنجی پسورد
	if len(input.Password) < 8 {
		return customError.ShortPasswordErr
	}

	// اعتبارسنجی بیو
	if len(input.Bio) > 1000 {
		return customError.TooLongBioErr
	}

	// چک کردن وجود کاربر با یوزرنیم
	err := indatabase.CheckAvailability(input)
	if errors.Is(err, customError.UsernameAlreadyExistErr) {
		return customError.UsernameAlreadyExistErr
	}

	// چک کردن وجود کاربر با ایمیل
	existingUser, err := indatabase.GetUserByEmail(input.Email)
	if err != nil {
		return customError.InternalErr
	}
	if existingUser != nil {
		return customError.EmailAlreadyExistErr
	}

	// هش کردن پسورد
	hashedPassword, err := HashPassword(input.Password)
	if err != nil {
		return customError.InternalErr
	}

	// ثبت‌نام کاربر
	err = indatabase.Register(input, hashedPassword)
	if err != nil {
		return customError.InternalErr
	}

	// 🔥 دریافت کاربر جدید برای ذخیره توکن
	user, err := indatabase.GetUserByEmail(input.Email)
	if err != nil {
		return customError.InternalErr
	}
	if user == nil {
		return customError.InternalErr
	}

	// 🔥 تولید و ذخیره توکن تایید
	emailService := &EmailVerificationService{}
	token, err := emailService.GenerateVerificationToken()
	if err != nil {
		return customError.InternalErr
	}

	expiry := time.Now().Add(15 * time.Minute)
	if err := indatabase.SaveVerificationToken(user.ID, token, expiry); err != nil {
		return customError.InternalErr
	}

	// 🔥 ارسال ایمیل تایید (غیرهمزمان برای جلوگیری از کندی)
	go func() {
		if err := emailService.SendVerificationEmail(input.Email, token); err != nil {
			log.Printf("Failed to send verification email to %s: %v", input.Email, err)
		}
	}()

	return nil
}

func isValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

func HashPassword(pass string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(pass), 10)
	if err != nil {
		log.Println("error while password hashing, ", err)
		return "", err
	}
	return string(hashedPassword), nil
}