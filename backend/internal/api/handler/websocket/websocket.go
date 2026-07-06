package handler

import (
	"encoding/json"
	"log"
	"time"

	"github.com/AliasgharHeidari/chat-app/internal/model"
	indatabase "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
	messageService "github.com/AliasgharHeidari/chat-app/internal/service/chat"
	"github.com/AliasgharHeidari/chat-app/internal/utils"
	websocketPkg "github.com/AliasgharHeidari/chat-app/internal/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

// use the shared hub instance from websocket package
var hub = websocketPkg.HubInstance

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

		// Notify existing clients about this user's online status (exclude self)
		// and send current online users to newly connected client
		online := hub.GetOnlineUsers()
		for _, uid := range online {
			if uid == client.ID {
				continue
			}
			msg := model.WSMessage{
				Type: model.WSMessageUserStatus,
				Data: model.WSUserStatusData{
					UserID:   uid,
					IsOnline: true,
				},
			}
			b, _ := json.Marshal(msg)
			client.Send <- b
		}

		// Broadcast that this client is now online to others
		onlineMsg := model.WSMessage{
			Type: model.WSMessageUserStatus,
			Data: model.WSUserStatusData{
				UserID:   client.ID,
				IsOnline: true,
			},
		}
		onlineBytes, _ := json.Marshal(onlineMsg)
		hub.Broadcast(onlineBytes, client.ID)

		// done is closed the moment the read loop dies (connection closed/error).
		// This lets the write loop below stop waiting on client.Send and return,
		// which in turn runs the deferred cleanup/offline-broadcast.
		done := make(chan struct{})

		defer func() {
			// On disconnect, unregister and broadcast offline status
			hub.Unregister(client)
			lastSeen := time.Now().Format(time.RFC3339)
			offlineMsg := model.WSMessage{
				Type: model.WSMessageUserStatus,
				Data: model.WSUserStatusData{
					UserID:   client.ID,
					IsOnline: false,
					LastSeen: &lastSeen,
				},
			}
			offlineBytes, _ := json.Marshal(offlineMsg)
			hub.Broadcast(offlineBytes, client.ID)
			conn.Close()
		}()

		go func() {
			defer close(done)
			for {
				var msg model.WSMessage
				err := conn.ReadJSON(&msg)
				if err != nil {
					break
				}
				handleMessage(client, msg)
			}
		}()

		for {
			select {
			case msg, ok := <-client.Send:
				if !ok {
					return
				}
				if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
					return
				}
			case <-done:
				return
			}
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

		chat, err := messageService.GetChatByChatID(client.ID, chatID)
		if err != nil {
			log.Printf("❌ Chat not found: %v", err)
			client.Send <- []byte(`{"type":"error","data":"Chat not found"}`)
			return
		}
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
		if ok := hub.SendToUser(receiverID, responseBytes); !ok {
			log.Printf("❌ Failed to deliver message to user %d", receiverID)
		}

	case "typing":
		data, ok := msg.Data.(map[string]interface{})
		if !ok {
			log.Println("❌ Invalid typing data")
			return
		}

		chatID := uint(data["chat_id"].(float64))
		isTyping := data["is_typing"].(bool)

		chat, err := messageService.GetChatByChatID(client.ID, chatID)
		if err != nil {
			log.Printf("❌ Chat not found for typing: %v", err)
			return
		}
		receiverID := chat.GetOtherUser(client.ID)

		typingMsg := model.WSMessage{
			Type: "typing",
			Data: model.WSTypingData{
				ChatID:   chatID,
				UserID:   client.ID,
				IsTyping: isTyping,
			},
		}
		tb, _ := json.Marshal(typingMsg)
		if ok := hub.SendToUser(receiverID, tb); !ok {
			log.Printf("❌ Failed to deliver typing event to user %d", receiverID)
		}

	case "ping":
		client.Send <- []byte(`{"type":"pong"}`)

	case "message_status":
		data, ok := msg.Data.(map[string]interface{})
		if !ok {
			log.Println("❌ Invalid message_status data")
			return
		}

		messageID := uint(data["message_id"].(float64))
		status := data["status"].(string)

		dbMsg, err := indatabase.GetMessageByID(messageID)
		if err != nil {
			log.Printf("❌ Message not found: %v", err)
			return
		}

		err = messageService.MarkMessageAsSeen(messageID)
		if err != nil {
			log.Printf("❌ Failed to update message status: %v", err)
			return
		}

		statusMsg := model.WSMessage{
			Type: "message_status",
			Data: model.WSMessageStatusData{
				MessageID: messageID,
				Status:    status,
				SeenAt:    time.Now().Format(time.RFC3339),
			},
		}
		sb, _ := json.Marshal(statusMsg)
		if ok := hub.SendToUser(dbMsg.SenderID, sb); !ok {
			log.Printf("❌ Failed to deliver status update to user %d", dbMsg.SenderID)
		}

	default:
		log.Printf("❌ Unknown type: %s", msg.Type)
	}
}