package handler

import (
	"encoding/json"
	"log"
	"time"

	"github.com/AliasgharHeidari/chat-app/internal/model"
	"github.com/AliasgharHeidari/chat-app/internal/utils"
	websocketPkg "github.com/AliasgharHeidari/chat-app/internal/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	messageService 	"github.com/AliasgharHeidari/chat-app/internal/service/chat"
)


var hub = websocketPkg.NewHub()

func WebSocketHandler(c *fiber.Ctx) error {
	if !websocket.IsWebSocketUpgrade(c) {
		return c.Status(400).JSON(fiber.Map{"error": "Upgrade required"})
	}

	token := c.Query("token")
	if token == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Token required"})
	}

	claims, err := utils.ValidateJWT(token)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid token"})
	}

	userID := claims.UserID

	return websocket.New(func(conn *websocket.Conn) {
		client := websocketPkg.NewClient(userID, conn)
		hub.Register(client)
		defer hub.Unregister(client)

		go func() {
			for {
				var msg model.WSMessage
				if err := conn.ReadJSON(&msg); err != nil {
					break
				}
				handleMessage(client, msg)
			}
		}()

		for msg := range client.Send {
			conn.WriteJSON(msg)
		}
	})(c)
}

func handleMessage(client *websocketPkg.Client, msg model.WSMessage) {
	log.Printf("📩 User %d sent: %s", client.ID, msg.Type)

	switch msg.Type {
case "new_message":
    data, ok := msg.Data.(map[string]interface{})
    if !ok {
        log.Println("❌ Invalid data")
        return
    }

    chatID := uint(data["chat_id"].(float64))
    text := data["message"].(string)


    savedMsg, err := messageService.SendMessage(chatID, client.ID, text)
    if err != nil {
        log.Println("❌ Save error:", err)
        return
    }


    chat, _ := messageService.GetChatByChatID(chatID, client.ID)
    receiverID := chat.GetOtherUser(client.ID)


    response := model.WSMessage{
        Type: "new_message",
        Data: model.WSNewMessageData{
            MessageID:   savedMsg.ID,
            ChatID:      savedMsg.ChatID,
            SenderID:    savedMsg.SenderID,
            SenderName:  savedMsg.Sender.FirstName + " " + savedMsg.Sender.LastName,
            MessageText: savedMsg.MessageText,
            Status:      string(savedMsg.Status),
            CreatedAt:   savedMsg.CreatedAt.Format(time.RFC3339),
        },
    }

    responseBytes, _ := json.Marshal(response)


    client.Send <- responseBytes
    hub.SendToUser(receiverID, responseBytes)

	case "ping":
		client.Send <- []byte(`{"type":"pong"}`)

	default:
		log.Printf("❌ Unknown type: %s", msg.Type)
	}
}