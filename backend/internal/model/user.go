// backend/internal/model/user.go
package model

import "time"

type User struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	Username      string     `gorm:"uniqueIndex;size:50;not null" json:"username"`
	FirstName     string     `gorm:"not null" json:"first_name"`
	LastName      string     `gorm:"not null" json:"last_name"`
	Bio           string     `gorm:"text" json:"bio"`
	ProfilePicURL string     `gorm:"size:500" json:"profile_pic_url"`
	PasswordHash  string     `gorm:"size:255" json:"-"`
	Email         string     `gorm:"uniqueIndex;size:100;not null" json:"email"`
	GoogleID      *string     `gorm:"uniqueIndex;size:100" json:"-"`
	
	EmailVerified bool      `gorm:"default:false" json:"email_verified"`
	VerifyToken   string    `gorm:"size:100;index" json:"-"`
	VerifyExpiry  time.Time `json:"-"`
	
	IsOnline      bool       `gorm:"default:false" json:"is_online"`
	LastSeen      *time.Time `json:"last_seen"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

func (u *User) FullName() string {
	return u.FirstName + " " + u.LastName
}