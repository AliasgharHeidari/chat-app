package service

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	Profileindatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/profile"
)

func ModifyProfile(UserID uint, input model.UpdateProfileRequest) error {

	
	updates := map[string]interface{}{}
	
	if input.Username != nil {
		if len(*input.Username) < 5 || len(*input.Username) > 50 {
			return customError.InvalidUsernameErr
		}
		err := Profileindatabase.CheckIfUsernameIsAvailable(*input.Username, UserID)
		if errors.Is(err, customError.UsernameAlreadyExistErr) {
			return customError.UsernameAlreadyExistErr
		}
		updates["username"] = *input.Username
	}
	if input.FirstName != nil {
		updates["first_name"] = *input.FirstName
	}
	if input.LastName != nil {
		updates["last_name"] = *input.LastName
	}
	if input.Bio != nil {
		if len(*input.Bio) > 1000 {
			return customError.TooLongBioErr
		}
		updates["bio"] = *input.Bio
	}
	if input.ProfilePicURL != nil {
		updates["profile_pic_url"] = *input.ProfilePicURL
	}

	if len(updates) == 0 {
		return nil
	}

	err := Profileindatabase.ModifyProfile(updates, UserID)
	if errors.Is(err, customError.InternalErr) {
		return customError.InternalErr
	} 

	return nil
}
