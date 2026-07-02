package service

import (
	"errors"
	"log"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
)

func DeleteMessage(messageID uint, userID uint, deleteForEveryone bool) error {

	log.Printf("🔍 Service deleteForEveryone: %v", deleteForEveryone)

	message, err := indatabase.GetMessageByID(messageID)
	if err != nil {
		if errors.Is(err, customError.NotFoundErr) {
			return customError.NotFoundErr
		}
		return customError.InternalErr
	}

	if message.IsDeleted {
		return customError.MessageAlreadyDeletedErr
	}

	// ❌ فقط فرستنده میتونه برای همه حذف کنه
	if message.SenderID != userID && deleteForEveryone {
		return customError.AccessDeniedErr
	}

	// ✅ هر کسی میتونه برای خودش حذف کنه (حذف شرط SenderID)
	if !deleteForEveryone {
		return indatabase.DeleteMessageForMe(messageID, userID)
	}

	// ✅ حذف برای همه (فقط فرستنده میتونه)
	return indatabase.DeleteMessageForEveryone(messageID, userID)
}