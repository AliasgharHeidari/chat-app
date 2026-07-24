package model

import "time"

type MessageStatus string

const (
	MessageStatusSending   MessageStatus = "sending"
	MessageStatusSent      MessageStatus = "sent"
	MessageStatusDelivered MessageStatus = "delivered"
	MessageStatusSeen      MessageStatus = "seen"
	MessageStatusFailed    MessageStatus = "failed"
)

type Message struct {
	ID          uint          `gorm:"primaryKey" json:"id"`
	ChatID      uint          `gorm:"not null;index:idx_messages_chat" json:"chat_id"`
	SenderID    uint          `gorm:"not null;index:idx_messages_sender" json:"sender_id"`
	MessageText string        `gorm:"type:text;not null" json:"message_text"`
	Status      MessageStatus `gorm:"default:sent" json:"status"`
	IsEdited    bool          `gorm:"default:false" json:"is_edited"`
	EditedAt    *time.Time    `json:"edited_at,omitempty"`
	IsDeleted   bool          `gorm:"default:false" json:"is_deleted"`
	DeletedFor  *uint         `json:"deleted_for,omitempty"`
	SeenAt      *time.Time    `json:"seen_at,omitempty"`
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
	
	LinkPreview *LinkPreviewData `gorm:"serializer:json" json:"link_preview,omitempty"`

	// relations

	Chat   Chat `gorm:"foreignKey:ChatID" json:"-"`
	Sender User `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
}

type LinkPreviewData struct {
	URL         string `json:"url"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Image       string `json:"image"`
	SiteName    string `json:"site_name"`
	Favicon     string `json:"favicon"`
}

func (m *Message) GetDisplayText() string {
	if m.IsDeleted {
		return "This message wasd deleted"
	}
	return m.MessageText
}
