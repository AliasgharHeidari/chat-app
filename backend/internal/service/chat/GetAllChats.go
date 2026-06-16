package service

import (
	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
)

func GetAllChats(CurrentUserID uint) ([]model.Chat ,error) {
		return indatabase.GetAllChats(CurrentUserID)

}