package handler

import (
	"encoding/json"
	"strconv"
	"time"

	customError "github.com/AliasgharHeidari/chat-app/internal/errors"
	"github.com/AliasgharHeidari/chat-app/internal/model"
	service "github.com/AliasgharHeidari/chat-app/internal/service/chat"
	websocketPkg "github.com/AliasgharHeidari/chat-app/internal/websocket"
	"github.com/gofiber/fiber/v2"
)

func ModifyMessage(c *fiber.Ctx) error {
	userID := c.Locals("id").(uint)

	messageID, err := strconv.ParseUint(c.Params("message_id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Invalid message ID",
		})
	}

	var input model.EditMessageRequest
	err = c.BodyParser(&input)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if input.NewText == "" {
		return c.Status(400).JSON(fiber.Map{
			"error": "new_text is required",
		})
	}

	if len(input.NewText) > 1000 {
		return c.Status(400).JSON(fiber.Map{
			"error": "new_text must be less than 1000 characters",
		})
	}

	updatedMessage, err := service.ModifyMessage(userID, input.NewText, uint(messageID))
	if err != nil {
		if err == customError.MessageNotFoundErr {
			return c.Status(404).JSON(fiber.Map{
				"error": "Message not found",
			})
		}
		if err == customError.AccessDeniedErr {
			return c.Status(403).JSON(fiber.Map{
				"error": "You can only edit your own messages",
			})
		}
		if err == customError.MessageDeletedErr {
			return c.Status(400).JSON(fiber.Map{
				"error": "Cannot edit a deleted message",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"error": "internal server error",
		})
	}

	// Broadcast edit event to other participant(s)
	chat, err2 := service.GetChatByChatID(userID, updatedMessage.ChatID)
	if err2 == nil {
		otherID := chat.GetOtherUser(userID)
		editedAtStr := ""
		if updatedMessage.EditedAt != nil {
			editedAtStr = updatedMessage.EditedAt.Format(time.RFC3339)
		}
		wsMsg := model.WSMessage{
			Type: model.WSMessageMessageEdited,
			Data: model.WSMessageEditedData{
				MessageID: updatedMessage.ID,
				NewText:   updatedMessage.MessageText,
				EditedAt:  editedAtStr,
			},
		}
		b, _ := json.Marshal(wsMsg)
		// send to other participant and to the editor (in case they have other sessions)
		websocketPkg.HubInstance.SendToUser(otherID, b)
		websocketPkg.HubInstance.SendToUser(userID, b)
	}

	return c.Status(200).JSON(fiber.Map{
		"message": "Message edited successfully",
		"data":    updatedMessage,
	})
}
