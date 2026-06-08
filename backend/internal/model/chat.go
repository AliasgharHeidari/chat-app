package model

import "time"

type Chat struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	User1ID   uint      `gorm:"not null;index:idx_chat_users" json:"user1_id"`
	User2ID   uint      `gorm:"not null;index:idx_chat_users" json:"user2_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// روابط (برای Preload)
	User1    User      `gorm:"foreignKey:User1ID" json:"user1,omitempty"`
	User2    User      `gorm:"foreignKey:User2ID" json:"user2,omitempty"`
	Messages []Message `gorm:"foreignKey:ChatID" json:"messages,omitempty"`
}

func (c *Chat) GetOtherUser(currentUserID uint) uint {
	if c.User1ID == currentUserID {
		return c.User2ID
	}
	return c.User1ID
}
