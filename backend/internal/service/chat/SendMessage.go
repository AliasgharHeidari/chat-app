package service

import (
	"log"
	"regexp"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
	"github.com/AliasgharHeidari/chat-app/internal/utils"
)

// 🔥 Regex برای تشخیص لینک
var urlRegex = regexp.MustCompile(`https?://[^\s]+`)

func SendMessage(chatID uint, senderID uint, MessageText string) (*model.Message, error) {

	chat, err := indatabase.GetChatByChatID(senderID, chatID)
	if err != nil {
		return nil, customError.InternalErr
	}

	if chat.User1ID != senderID && chat.User2ID != senderID {
		return nil, customError.AccessDeniedErr
	}

	cleanText := utils.SanitizeMessage(MessageText)

	message := &model.Message{
		ChatID:      chatID,
		SenderID:    senderID,
		MessageText: cleanText,
		Status:      model.MessageStatusSent,
	}

	// 🔥 تشخیص لینک در متن و دریافت preview
	urls := urlRegex.FindAllString(MessageText, -1)
	if len(urls) > 0 {
		// فقط اولین لینک رو بررسی کن
		linkService := NewLinkPreviewService()
		preview, err := linkService.ExtractLinkPreview(urls[0])
		if err == nil && preview != nil {
			message.LinkPreview = &model.LinkPreviewData{
				URL:         preview.URL,
				Title:       preview.Title,
				Description: preview.Description,
				Image:       preview.Image,
				SiteName:    preview.SiteName,
				Favicon:     preview.Favicon,
			}
		}
	}

	if err := indatabase.SendMessage(message); err != nil {
		return nil, customError.InternalErr
	}

	if err := indatabase.UpdateChatTimestamp(chatID); err != nil {
		log.Println(err)
	}

	messageWithSender, err := indatabase.GetMessageByID(message.ID)
	if err != nil {
		return nil, customError.InternalErr
	}

	return messageWithSender, nil
}