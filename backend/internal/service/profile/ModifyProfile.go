// backend/internal/service/profile/ModifyProfile.go
package service

import (
	"errors"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	Profileindatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/profile"
	"github.com/AliasgharHeidari/chat-app/internal/utils"
)

func ModifyProfile(UserID uint, input model.UpdateProfileRequest) error {

	updates := map[string]interface{}{}

	// 🔥 پاکسازی و اعتبارسنجی Username
	if input.Username != nil {
		cleanUsername := utils.SanitizeInput(*input.Username)
		if len(cleanUsername) < 5 || len(cleanUsername) > 50 {
			return customError.InvalidUsernameErr
		}
		err := Profileindatabase.CheckIfUsernameIsAvailable(cleanUsername, UserID)
		if errors.Is(err, customError.UsernameAlreadyExistErr) {
			return customError.UsernameAlreadyExistErr
		}
		updates["username"] = cleanUsername
	}

	// 🔥 پاکسازی FirstName
	if input.FirstName != nil {
		cleanFirstName := utils.SanitizeInput(*input.FirstName)
		if len(cleanFirstName) > 50 {
			return customError.InvalidFirstNameErr
		}
		updates["first_name"] = cleanFirstName
	}

	// 🔥 پاکسازی LastName
	if input.LastName != nil {
		cleanLastName := utils.SanitizeInput(*input.LastName)
		if len(cleanLastName) > 50 {
			return customError.InvalidLastNameErr
		}
		updates["last_name"] = cleanLastName
	}

	if input.Bio != nil {
		cleanBio := utils.SanitizeInput(*input.Bio)
		if len(cleanBio) > 1000 {
			return customError.TooLongBioErr
		}
		updates["bio"] = cleanBio
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