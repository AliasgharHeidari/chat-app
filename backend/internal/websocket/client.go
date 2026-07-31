package websocket

import (
	"time"

	"github.com/gofiber/websocket/v2"
	"golang.org/x/time/rate"
)

// این دو مقدار رو می‌تونید مطابق نیازتون تغییر بدید
const (
	messagesPerMinute = 20 // حداکثر پیام مجاز در دقیقه برای هر کاربر
	messageBurst      = 5  // چند پیام اول همیشه بدون تاخیر رد می‌شن (تایپ سریع رو خراب نمی‌کنه)
)

type Client struct {
	ID   uint
	Conn *websocket.Conn
	Send chan []byte

	// ✅ ریت‌لیمیت per-user برای پیام‌های وب‌سوکت (new_message).
	// چون این پیام‌ها به‌صورت فریم روی یه کانکشن باز رد می‌شن (نه
	// درخواست HTTP جدید)، میدل‌ور Fiber (messageLimiter) اصلاً براشون
	// صدا زده نمی‌شه؛ باید همین‌جا، تو خودِ لایه‌ی وب‌سوکت چک بشه.
	MsgLimiter *rate.Limiter
}

func NewClient(id uint, conn *websocket.Conn) *Client {
	return &Client{
		ID:         id,
		Conn:       conn,
		Send:       make(chan []byte, 100),
		MsgLimiter: rate.NewLimiter(rate.Every(time.Minute/messagesPerMinute), messageBurst),
	}
}