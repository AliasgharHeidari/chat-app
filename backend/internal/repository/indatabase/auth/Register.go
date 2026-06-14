package indatabase

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/erros"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
	"gorm.io/gorm"
)

func CheckAvailability(input model.RegisterRequest) error {
	var user model.User

	db := postgres.GetDB()

	res := db.Where("username = ?", input.Username).First(&user)
	if errors.Is(res.Error, gorm.ErrRecordNotFound) {
		return nil
	}
	return customError.UsernameAlreadyExistErr

}

func Register(input model.RegisterRequest, hashedpassword string) error {
	db := postgres.GetDB()
	tx := db.Begin()

	user := &model.User{
		Username:       input.Username,
		FirstName:    input.FirstName,
		LastName:     input.LastName,
		Bio:          input.Bio,
		PasswordHash: hashedpassword,
		ProfilePicURL: input.ProfilePicURL,
	}

	res := tx.Create(user)
	if res.Error != nil {
		tx.Rollback()
		return customError.InternalErr
	}

	if err := tx.Commit().Error; err != nil {
		return customError.InternalErr
	}
	return nil
}
