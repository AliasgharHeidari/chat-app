package indatabase

import (
	"errors"
	customError "github.com/AliasgharHeidari/chat-app/internal/erros"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
	"gorm.io/gorm"
)

func FindUserByUsername(username string) (*model.User, error) {
	db := postgres.GetDB()
	var user model.User

	res := db.Where("username ILIKE ?", username).First(&user)
	if res.Error != nil {
		if errors.Is(res.Error, gorm.ErrRecordNotFound) {
			return nil, customError.NotFoundErr
		}
		return nil, customError.InternalErr
	}

	return &user, nil

}

func FindPrivateChat(currentUserID uint, TargetUserID uint) (*model.Chat, error) {
	db := postgres.GetDB()
	var chat model.Chat

	res := db.
	Preload("User1").
	Preload("User2").
	Where("(user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)", currentUserID, TargetUserID, TargetUserID, currentUserID).First(&chat)
	if res.Error != nil {
		if errors.Is(res.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, customError.InternalErr
	}

	return &chat, nil

}

func CreateChat(chat *model.Chat) error {
	db := postgres.GetDB()

	res := db.Create(chat)
	if res.Error != nil {
		return customError.InternalErr
	}
	return nil
}
