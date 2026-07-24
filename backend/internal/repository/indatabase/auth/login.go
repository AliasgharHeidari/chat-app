package indatabase

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
	"gorm.io/gorm"
)

func CheckIfUserExist(input model.LoginRequest) (model.User, error) {
	db := postgres.GetDB()
	var user model.User
	res := db.Model(&model.User{}).Where("username ILIKE ?", input.Username).First(&user)
	if errors.Is(res.Error, gorm.ErrRecordNotFound) {
		return model.User{}, customError.InvalidCredenntialsErr
	}
	if res.Error != nil {
		return model.User{}, customError.InternalErr
	}
	return user, nil
}
func GetUserByID(userID uint) (*model.User, error) {
	var user model.User
	err := postgres.DB.First(&user, userID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}
