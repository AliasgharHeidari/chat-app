// backend/internal/model/link_preview.go
package model

import "time"

// LinkPreview اطلاعات پیش‌نمایش لینک
type LinkPreview struct {
	URL         string `json:"url"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Image       string `json:"image"`
	SiteName    string `json:"site_name"`
	Favicon     string `json:"favicon"`
}

// CachedLinkPreview برای کش کردن در دیتابیس
type CachedLinkPreview struct {
	ID          uint      `gorm:"primaryKey"`
	URL         string    `gorm:"uniqueIndex;size:500"`
	Title       string    `gorm:"size:500"`
	Description string    `gorm:"size:1000"`
	Image       string    `gorm:"size:500"`
	SiteName    string    `gorm:"size:200"`
	Favicon     string    `gorm:"size:500"`
	CreatedAt   time.Time `gorm:"index"`
	ExpiresAt   time.Time `gorm:"index"`
}