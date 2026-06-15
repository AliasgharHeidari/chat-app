package indatabase

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/erros"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
	"gorm.io/gorm"
)

func GetUserByUsername(username string) (*model.SearchUsersResponse, error) {
	db := postgres.GetDB()

	var user model.SearchUsersResponse

	res := db.Model(&model.User{}).Select("id, username, first_name, last_name, bio, profile_pic_url, is_online").Where("username ILIKE ?", username).First(&user)

	if res.Error != nil {
		if errors.Is(res.Error, gorm.ErrRecordNotFound) {
			return nil, customError.NotFoundErr
		}
		return nil, customError.InternalErr
	}
	
	return &user, nil

}
