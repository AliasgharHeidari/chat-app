package service

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/AliasgharHeidari/chat-app/internal/config"
	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	auth "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/auth"
	"github.com/AliasgharHeidari/chat-app/internal/utils"
)

type EmailVerificationService struct{}

// GenerateVerificationToken تولید توکن ۶ رقمی
func (s *EmailVerificationService) GenerateVerificationToken() (string, error) {
	bytes := make([]byte, 3) // 3 bytes = 6 hex chars
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// SendVerificationEmail ارسال ایمیل تایید
func (s *EmailVerificationService) SendVerificationEmail(email, token string) error {
	subject := "Verify Your Email - Chat App"

	// HTML Template برای ایمیل
	body := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
				.container { max-width: 500px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
				.header { text-align: center; margin-bottom: 30px; }
				.header h1 { color: #333; font-size: 24px; }
				.code { 
					background: #f0f4ff; 
					padding: 20px; 
					border-radius: 8px;
					text-align: center;
					font-size: 36px;
					font-weight: bold;
					letter-spacing: 8px;
					color: #4a6cf7;
					margin: 20px 0;
				}
				.text { color: #666; line-height: 1.6; text-align: center; }
				.footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>🔐 Verify Your Email</h1>
				</div>
				<p class="text">Thank you for signing up! Please use the verification code below to activate your account:</p>
				<div class="code">%s</div>
				<p class="text">This code will expire in <strong>15 minutes</strong>.</p>
				<p class="text" style="font-size: 14px; color: #888;">
					If you didn't create an account with us, please ignore this email.
				</p>
				<div class="footer">
					<p>Chat App - Connect with friends instantly</p>
				</div>
			</div>
		</body>
		</html>
	`, token)

	return utils.SendEmail(email, subject, body)
}

// SendVerificationLink ارسال لینک تایید (روش جایگزین با لینک)
func (s *EmailVerificationService) SendVerificationLink(email, token string) error {
	cfg := config.AppConfig
	verifyURL := fmt.Sprintf("%s/verify-email?email=%s&code=%s", cfg.AppURL, email, token)

	subject := "Verify Your Email - Chat App"
	body := fmt.Sprintf(`
		<!DOCTYPE html>
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
				.container { max-width: 500px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
				.header { text-align: center; margin-bottom: 30px; }
				.header h1 { color: #333; font-size: 24px; }
				.text { color: #666; line-height: 1.6; text-align: center; }
				.button-container { text-align: center; margin: 30px 0; }
				.button {
					display: inline-block;
					padding: 14px 40px;
					background: #4a6cf7;
					color: white;
					text-decoration: none;
					border-radius: 6px;
					font-weight: 600;
				}
				.footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
			</style>
		</head>
		<body>
			<div class="container">
				<div class="header">
					<h1>🔐 Verify Your Email</h1>
				</div>
				<p class="text">Thank you for signing up! Click the button below to verify your email address:</p>
				<div class="button-container">
					<a href="%s" class="button">Verify Email</a>
				</div>
				<p class="text">Or copy and paste this link into your browser:</p>
				<p style="font-size: 12px; color: #4a6cf7; word-break: break-all;">%s</p>
				<p class="text">This link will expire in <strong>15 minutes</strong>.</p>
				<div class="footer">
					<p>Chat App - Connect with friends instantly</p>
				</div>
			</div>
		</body>
		</html>
	`, verifyURL, verifyURL)

	return utils.SendEmail(email, subject, body)
}

// VerifyEmail تایید ایمیل کاربر
func (s *EmailVerificationService) VerifyEmail(email, code string) error {
	// ۱. پیدا کردن کاربر با ایمیل و توکن
	user, err := auth.GetUserByEmailAndToken(email, code)
	if err != nil {
		return customError.InternalErr
	}
	if user == nil {
		return customError.InvalidVerificationCodeErr
	}

	// ۲. چک کردن انقضای توکن
	if user.VerifyExpiry.Before(time.Now()) {
		return customError.VerificationCodeExpiredErr
	}

	// ۳. تایید ایمیل
	if err := auth.VerifyUserEmail(user.ID); err != nil {
		return customError.InternalErr
	}

	return nil
}

// ResendVerificationEmail ارسال مجدد ایمیل تایید
func (s *EmailVerificationService) ResendVerificationEmail(email string) error {
	// ۱. پیدا کردن کاربر با ایمیل
	user, err := auth.GetUserByEmailForVerification(email)
	if err != nil {
		return customError.InternalErr
	}
	if user == nil {
		return customError.UserNotFoundErr
	}

	// ۲. اگر ایمیل قبلاً تایید شده
	if user.EmailVerified {
		return customError.EmailAlreadyVerifiedErr
	}

	// ۳. تولید توکن جدید
	token, err := s.GenerateVerificationToken()
	if err != nil {
		return customError.InternalErr
	}

	// ۴. ذخیره توکن جدید
	expiry := time.Now().Add(15 * time.Minute)
	if err := auth.SaveVerificationToken(user.ID, token, expiry); err != nil {
		return customError.InternalErr
	}

	// ۵. ارسال ایمیل
	if err := s.SendVerificationEmail(email, token); err != nil {
		return customError.EmailSendErr
	}

	return nil
}