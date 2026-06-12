package indatabase

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/erros"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
	"gorm.io/gorm"
)

func CheckIfUserExist(input model.LoginRequest) (model.User, error) {
	db := postgres.GetDB()
	var user model.User
	res := db.Model(&model.User{}).Where("username = ?", input.Username).First(&user)
	if errors.Is(res.Error, gorm.ErrRecordNotFound) {
		return model.User{}, customError.InvalidCredenntialsErr
	}
	if res.Error != nil {
		return model.User{}, customError.InternalErr
	}
	return user, nil
}
