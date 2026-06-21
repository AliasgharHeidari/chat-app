package service

import (
	"log"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
)

func SendMessage(chatID uint, senderID uint, MessageText string) (*model.Message, error) {

	chat, err := indatabase.GetChatByChatID(senderID, chatID)
	if err != nil {
		return nil, customError.InternalErr
	}

	if chat.User1ID != senderID && chat.User2ID != senderID {
		return nil, customError.AccessDeniedErr
	}

	message := &model.Message{
		ChatID:      chatID,
		SenderID:    senderID,
		MessageText: MessageText,
		Status:      model.MessageStatusSent,
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
