package websocket

import (
	"log"
	"sync"
)

type Hub struct {
	Clients map[uint]*Client
	mu      sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		Clients: make(map[uint]*Client),
	}
}

// HubInstance is the shared hub used across the application.
var HubInstance = NewHub()

func (h *Hub) Register(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if oldClient, ok := h.Clients[client.ID]; ok {
		oldClient.Conn.Close()
		delete(h.Clients, client.ID)
	}

	h.Clients[client.ID] = client
	log.Printf("✅ User %d is ONLINE", client.ID)
}

func (h *Hub) Unregister(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	delete(h.Clients, client.ID)
	log.Printf("❌ User %d is OFFLINE", client.ID)
}

func (h *Hub) SendToUser(userID uint, message []byte) bool {
	h.mu.RLock()
	client, ok := h.Clients[userID]
	h.mu.RUnlock()

	if !ok {
		log.Printf("⚠️ No websocket client for user %d", userID)
		return false
	}

	select {
	case client.Send <- message:
		return true
	default:
		log.Printf("⚠️ Dropping message to user %d: send buffer full", userID)
		return false
	}
}

func (h *Hub) Broadcast(message []byte, excludeUserID uint) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for id, client := range h.Clients {
		if id == excludeUserID {
			continue
		}
		select {
		case client.Send <- message:
		default:

		}
	}
}

func (h *Hub) GetOnlineUsers() []uint {
	h.mu.RLock()
	defer h.mu.RUnlock()

	users := make([]uint, 0, len(h.Clients))
	for id := range h.Clients {
		users = append(users, id)
	}
	return users
}

func (h *Hub) IsOnline(userID uint) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()

	_, ok := h.Clients[userID]
	return ok
}
