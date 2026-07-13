package utils

import (
	"fmt"
	"net/smtp"

	"github.com/AliasgharHeidari/chat-app/internal/config"
)

// SendEmail ارسال ایمیل با SMTP
func SendEmail(to, subject, body string) error {
	cfg := config.AppConfig

	// تنظیمات SMTP
	smtpHost := cfg.SMTPHost
	smtpPort := cfg.SMTPPort
	smtpUser := cfg.SMTPUser
	smtpPassword := cfg.SMTPPassword
	from := cfg.SMTPFrom

	// اگر تنظیمات SMTP کامل نیست، خطا بده
	if smtpUser == "" || smtpPassword == "" {
		return fmt.Errorf("SMTP credentials not configured")
	}

	// ساخت پیام
	msg := fmt.Sprintf("From: %s\r\n", from)
	msg += fmt.Sprintf("To: %s\r\n", to)
	msg += fmt.Sprintf("Subject: %s\r\n", subject)
	msg += "MIME-Version: 1.0\r\n"
	msg += "Content-Type: text/html; charset=UTF-8\r\n"
	msg += "\r\n"
	msg += body

	// احراز هویت
	auth := smtp.PlainAuth("", smtpUser, smtpPassword, smtpHost)

	// ارسال ایمیل
	addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
	err := smtp.SendMail(addr, auth, from, []string{to}, []byte(msg))
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}