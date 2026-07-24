package indatabase

import (
	"errors"
	"time"

	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
	"gorm.io/gorm"
)

// GetCachedLinkPreview دریافت اطلاعات کش‌شده
func GetCachedLinkPreview(url string) (*model.CachedLinkPreview, error) {
	var cached model.CachedLinkPreview
	err := postgres.DB.Where("url = ? AND expires_at > ?", url, time.Now()).
		First(&cached).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &cached, nil
}

// SaveCachedLinkPreview ذخیره اطلاعات در کش
func SaveCachedLinkPreview(cached *model.CachedLinkPreview) error {
	// اگر قبلاً وجود داشت، به‌روزرسانی کن
	var existing model.CachedLinkPreview
	err := postgres.DB.Where("url = ?", cached.URL).First(&existing).Error
	if err == nil {
		// به‌روزرسانی
		return postgres.DB.Model(&existing).Updates(map[string]interface{}{
			"title":        cached.Title,
			"description":  cached.Description,
			"image":        cached.Image,
			"site_name":    cached.SiteName,
			"favicon":      cached.Favicon,
			"expires_at":   cached.ExpiresAt,
			"updated_at":   time.Now(),
		}).Error
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}
	// ایجاد جدید
	return postgres.DB.Create(cached).Error
}

// CleanExpiredCache حذف کش‌های منقضی‌شده (اجرای دوره‌ای)
func CleanExpiredCache() error {
	return postgres.DB.Where("expires_at < ?", time.Now()).Delete(&model.CachedLinkPreview{}).Error
}