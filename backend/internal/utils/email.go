package utils

import (
	"fmt"
	"net/smtp"
	"strings"

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


// NormalizeGmailAddress ایمیل رو برای جلوگیری از ثبت تکراری نرمال‌سازی می‌کنه
func NormalizeGmailAddress(email string) string {
    // ۱. تبدیل به حروف کوچیک
    email = strings.ToLower(email)
    
    // ۲. جدا کردن اسم و دامنه
    parts := strings.Split(email, "@")
    if len(parts) != 2 {
        return email
    }
    
    local := parts[0]
    domain := parts[1]
    
    // ۳. فقط برای دامنه‌های گوگل (gmail.com و googlemail.com) اعمال کن
    if domain == "gmail.com" || domain == "googlemail.com" {
        // حذف تمام نقطه‌ها از بخش محلی
        local = strings.ReplaceAll(local, ".", "")
        // استاندارد کردن دامنه به gmail.com
        domain = "gmail.com"
        
        // حذف بخش "+" و هر چیزی که بعدش اومده (برای مرحله بعدی)
        if idx := strings.Index(local, "+"); idx != -1 {
            local = local[:idx]
        }
        
        return local + "@" + domain
    }
    
    // برای دامنه‌های دیگه، فقط حروف کوچیک برگردون
    return email
}

// IsGmailAddress بررسی می‌کنه که آیا ایمیل با دامنه gmail.com هست یا نه
func IsGmailAddress(email string) bool {
    parts := strings.Split(email, "@")
    if len(parts) != 2 {
        return false
    }
    domain := strings.ToLower(parts[1])
    
    // دامنه‌های معتبر گوگل رو چک می‌کنه
    return domain == "gmail.com" || domain == "googlemail.com"
}