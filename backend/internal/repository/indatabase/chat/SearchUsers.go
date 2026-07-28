package indatabase

import (
	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	postgres "github.com/AliasgharHeidari/chat-app/internal/repository"
)

func SearchUsers(query string, currentUserID uint) ([]model.SearchUsersResponse, error) {
	db := postgres.GetDB()

	var users []model.SearchUsersResponse

	res := db.Model(&model.User{}).Select("id, username, first_name, last_name, bio, profile_pic_url, is_online").Where("username ILIKE ? OR first_name ILIKE ? OR last_name ILIKE ?",
		"%"+query+"%", "%"+query+"%", "%"+query+"%").Where("Id != ?", currentUserID).Limit(20).Find(&users)

	if res.Error != nil {
		return nil, customError.InternalErr
	}

	return users, nil
}