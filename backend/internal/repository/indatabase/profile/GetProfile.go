package indatabase

import (
	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
)

func GetProfile(userID uint) (model.User, error) {
	db := postgres.GetDB()
	var user model.User

	res := db.Where("id = ?", userID).First(&user)
	if res.Error != nil {
		return model.User{}, customError.InternalErr
	}

	return user, nil

}
