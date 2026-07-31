package websocket

import (
	"log"
	"sync"
	"time"
)

type Hub struct {
	Clients          map[uint]*Client
	mu               sync.RWMutex
	connectionCounts map[string]int // IP -> تعداد اتصالات
	connectionMu     sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		Clients:          make(map[uint]*Client),
		connectionCounts: make(map[string]int),
	}
}

// HubInstance is the shared hub used across the application.
var HubInstance = NewHub()

// maxConnectionsPerIP حداکثر تعداد اتصال از هر IP در بازه زمانی
const maxConnectionsPerIP = 5
const connectionWindow = 10 * time.Second

func (h *Hub) Register(client *Client) {
	// 🔥 محدودیت تعداد اتصال از هر IP
	ip := client.Conn.RemoteAddr().String()
	if !h.checkAndRecordConnection(ip) {
		log.Printf("🚫 WebSocket - Too many connections from IP: %s", ip)
		client.Conn.Close()
		return
	}

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

	// فقط اگه کلاینت فعلی باشه حذف کن
	if existing, ok := h.Clients[client.ID]; ok && existing == client {
		delete(h.Clients, client.ID)
		log.Printf("❌ User %d is OFFLINE", client.ID)
	}
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

// 🔥 محدودیت اتصال WebSocket
func (h *Hub) checkAndRecordConnection(ip string) bool {
	h.connectionMu.Lock()
	defer h.connectionMu.Unlock()

	// پاک کردن اتصالات قدیمی‌تر از بازه زمانی
	if count, ok := h.connectionCounts[ip]; ok {
		if count >= maxConnectionsPerIP {
			return false
		}
	}

	// ثبت اتصال جدید
	h.connectionCounts[ip]++
	go func() {
		time.Sleep(connectionWindow)
		h.connectionMu.Lock()
		defer h.connectionMu.Unlock()
		h.connectionCounts[ip]--
		if h.connectionCounts[ip] <= 0 {
			delete(h.connectionCounts, ip)
		}
	}()

	return true
}