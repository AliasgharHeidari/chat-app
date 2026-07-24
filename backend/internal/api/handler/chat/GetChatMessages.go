package handler

import (
	"errors"
	"strconv"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	service "github.com/AliasgharHeidari/chat-app/internal/service/chat"
	"github.com/gofiber/fiber/v2"
)

// MessageResponse transforms Message model to match frontend expectations
type MessageResponse struct {
	ID          uint                   `json:"id"`
	ChatID      uint                   `json:"chat_id"`
	SenderID    uint                   `json:"sender_id"`
	SenderName  string                 `json:"sender_name"`
	MessageText string                 `json:"message_text"`
	Status      string                 `json:"status"`
	IsEdited    bool                   `json:"is_edited"`
	EditedAt    interface{}            `json:"edited_at,omitempty"`
	IsDeleted   bool                   `json:"is_deleted"`
	DeletedFor  *uint                  `json:"deleted_for,omitempty"`
	SeenAt      interface{}            `json:"seen_at,omitempty"`
	CreatedAt   string                 `json:"created_at"`
	UpdatedAt   string                 `json:"updated_at"`
	LinkPreview *model.LinkPreviewData `json:"link_preview,omitempty"`
}

func transformMessage(msg *model.Message) MessageResponse {
	senderName := "Unknown"
	if msg.Sender.FirstName != "" || msg.Sender.LastName != "" {
		senderName = msg.Sender.FirstName + " " + msg.Sender.LastName
	}

	return MessageResponse{
		ID:          msg.ID,
		ChatID:      msg.ChatID,
		SenderID:    msg.SenderID,
		SenderName:  senderName,
		MessageText: msg.MessageText,
		Status:      string(msg.Status),
		IsEdited:    msg.IsEdited,
		EditedAt:    msg.EditedAt,
		IsDeleted:   msg.IsDeleted,
		DeletedFor:  msg.DeletedFor,
		SeenAt:      msg.SeenAt,
		CreatedAt:   msg.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   msg.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		LinkPreview: msg.LinkPreview,
	}
}

func GetChatMessages(c *fiber.Ctx) error {
	currnetUserID := c.Locals("id").(uint)

	chatID, err := strconv.ParseUint(c.Params("chat_id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid chat ID",
		})
	}

	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	offset, _ := strconv.Atoi(c.Query("offset", "0"))

	if limit > 100 {
		limit = 100
	}

	messages, err := service.GetChatMessages(uint(chatID), currnetUserID, limit, offset)
	if err != nil {
		if errors.Is(err, customError.AccessDeniedErr) {
			return c.Status(401).JSON(fiber.Map{
				"error": "access denied error",
			})
		}
		if errors.Is(err, customError.NotFoundErr) {
			return c.Status(404).JSON(fiber.Map{
				"error": "could not find chat",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "internal server error",
		})
	}

	// Transform messages to match frontend expectations
	responseMessages := make([]MessageResponse, len(messages))
	for i, msg := range messages {
		responseMessages[i] = transformMessage(&msg)
	}

	return c.Status(200).JSON(fiber.Map{
		"messages": responseMessages,
		"count":    len(responseMessages),
		"limit":    limit,
		"offset":   offset,
	})
}
