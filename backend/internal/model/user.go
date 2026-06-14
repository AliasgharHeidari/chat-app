package model

import "time"

type User struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	Username      string     `gorm:"uniqueIndex;size:50;not null" json:"username"`
	FirstName     string     `gorm:"not null" json:"first_name"`
	LastName      string     `gorm:"not null" json:"last_name"`
	Bio           string     `gorm:"text"  json:"bio"`
	ProfilePicURL string     `gorm:"size:500" json:"profile_pic_url"`
	PasswordHash  string     `gorm:"not null" json:"-"`
	IsOnline      bool       `gorm:"default:false"  json:"is_online"`
	LastSeen      *time.Time `json:"last_seen"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

func (u *User) FullName() string {
	return u.FirstName + " " + u.LastName
}
