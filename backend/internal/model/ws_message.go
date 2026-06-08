package model

type WSMessageType string

const (
	WSMessageNewMessage     WSMessageType = "new_message"
	WSMessageMessageStatus  WSMessageType = "message_status"
	WSMessageTyping         WSMessageType = "typing"
	WSMessageUserStatus     WSMessageType = "user_status"
	WSMessageMessageDeleted WSMessageType = "message_deleted"
	WSMessageMessageEdited  WSMessageType = "message_edited"
	WSMessagePing           WSMessageType = "ping"
	WSMessagePong           WSMessageType = "pong"
)

type WSMessage struct {
	Type      WSMessageType `json:"type"`
	Data      interface{}   `json:"data"`
	TImestamp int64         `json:"timestamp"`
}

type WSNewMessageData struct {
	MessageID   uint   `json:"message_id"`
	ChatID      uint   `json:"chat_id"`
	SenderID    uint   `json:"sender_id"`
	SenderName  string `json:"sender_name"`
	MessageText string `json:"message_text"`
	Status      string `json:"status"`
	CreatedAt   string `json:"created_at"`
}

type WSMessageStatusData struct {
	MessageID uint   `json:"message_id"`
	Status    string `json:"status"`
	SeenAt    string `json:"seen_at,omitempty"`
}

type WSTypingData struct {
	ChatID   uint `json:"chat_id"`
	UserID   uint `json:"user_id"`
	IsTyping bool `json:"is_typing"`
}

type WSUserStatusData struct {
	UserID   uint    `json:"user_id"`
	IsOnline bool    `json:"is_online"`
	LastSeen *string `json:"last_seen,omitempty"`
}

type WSMessageEditedData struct {
	MessageID uint   `json:"message_id"`
	NewText   string `json:"new_text"`
	EditedAt  string `json:"edited_at"`
}

type WSMessageDeletedData struct {
	MessageID uint `json:"message_id"`
	ChatID    uint `json:"chat_id"`
}
