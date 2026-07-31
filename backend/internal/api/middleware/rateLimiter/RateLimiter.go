package rateLimiter

import (
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/time/rate"
)

// clientLimiter holds per-IP limiter with last seen time
type clientLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// IPRateLimiter manages per-key limiters (per-IP for HTTP, per-user for WebSocket)
type IPRateLimiter struct {
	mu      sync.Mutex
	clients map[string]*clientLimiter
	limit   rate.Limit
	burst   int
	ttl     time.Duration // how long to keep idle clients
}

// newIPRateLimiter creates a new per-key rate limiter
func newIPRateLimiter(r rate.Limit, burst int) *IPRateLimiter {
	rl := &IPRateLimiter{
		clients: make(map[string]*clientLimiter),
		limit:   r,
		burst:   burst,
		ttl:     5 * time.Minute,
	}
	// Background cleanup goroutine
	go rl.cleanupLoop()
	return rl
}

// getLimiter returns or creates a limiter for the given key
func (rl *IPRateLimiter) getLimiter(key string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	client, exists := rl.clients[key]
	if !exists {
		client = &clientLimiter{
			limiter: rate.NewLimiter(rl.limit, rl.burst),
		}
		rl.clients[key] = client
	}
	client.lastSeen = time.Now()
	return client.limiter
}

// cleanupLoop removes stale entries to prevent memory leaks
func (rl *IPRateLimiter) cleanupLoop() {
	ticker := time.NewTicker(rl.ttl)
	defer ticker.Stop()
	for range ticker.C {
		rl.mu.Lock()
		for key, client := range rl.clients {
			if time.Since(client.lastSeen) > rl.ttl {
				delete(rl.clients, key)
			}
		}
		rl.mu.Unlock()
	}
}

// Allow checks the limiter for an arbitrary key (IP, user ID, etc.)
// without going through the Fiber middleware chain.
// 🔥 استفاده در جاهایی مثل هندلر WebSocket که خارج از چرخه‌ی
// معمول HTTP middleware اجرا میشن.
func (rl *IPRateLimiter) Allow(key string) bool {
	return rl.getLimiter(key).Allow()
}

// Middleware returns a Fiber middleware handler (for normal REST routes)
func (rl *IPRateLimiter) Middleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		ip := c.IP()
		if !rl.Allow(ip) {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error":   "Too Many Requests, slow down!",
				"message": "Rate limit exceeded. Please try again later.",
			})
		}
		return c.Next()
	}
}