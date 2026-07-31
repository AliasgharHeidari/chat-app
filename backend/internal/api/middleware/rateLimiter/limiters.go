package rateLimiter

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/time/rate"
)

// Config holds rate limiter configuration
type Config struct {
	RequestsPerMinute int
	Burst             int
}

// newLimiterMiddleware creates a Fiber middleware with given config
func newLimiterMiddleware(cfg Config) fiber.Handler {
	rl := newRawLimiter(cfg)
	return rl.Middleware()
}

// newRawLimiter creates the underlying *IPRateLimiter without wrapping it
// in Fiber middleware — usable directly (e.g. inside the WebSocket handler).
func newRawLimiter(cfg Config) *IPRateLimiter {
	r := rate.Every(time.Minute / time.Duration(cfg.RequestsPerMinute))
	return newIPRateLimiter(r, cfg.Burst)
}

// ─────────────────────────────────────────────
// Pre-built limiters (call these in server.go)
// ─────────────────────────────────────────────

// AuthLimiter limits authentication attempts
func AuthLimiter() fiber.Handler {
	return newLimiterMiddleware(Config{
		RequestsPerMinute: 2,
		Burst:             3,
	})
}

// RegisterLimiter limits registration attempts
func RegisterLimiter() fiber.Handler {
	return newLimiterMiddleware(Config{
		RequestsPerMinute: 3,
		Burst:             3,
	})
}

// GoogleAuthLimiter limits Google OAuth attempts
func GoogleAuthLimiter() fiber.Handler {
	return newLimiterMiddleware(Config{
		RequestsPerMinute: 5,
		Burst:             5,
	})
}

// SearchLimiter limits search requests
func SearchLimiter() fiber.Handler {
	return newLimiterMiddleware(Config{
		RequestsPerMinute: 30,
		Burst:             30,
	})
}

// MessageLimiter limits message sending over REST (kept for the REST route)
func MessageLimiter() fiber.Handler {
	return newLimiterMiddleware(Config{
		RequestsPerMinute: 10,
		Burst:             10,
	})
}

// 🔥 MessageRateLimiterRaw limits message sending over WebSocket
// (the actual path the frontend uses). Call .Allow(key) directly.
func MessageRateLimiterRaw() *IPRateLimiter {
	return newRawLimiter(Config{
		RequestsPerMinute: 10,
		Burst:             10,
	})
}

// ChatInitLimiter limits chat initialization
func ChatInitLimiter() fiber.Handler {
	return newLimiterMiddleware(Config{
		RequestsPerMinute: 10,
		Burst:             10,
	})
}

// GeneralLimiter limits general API requests
func GeneralLimiter() fiber.Handler {
	return newLimiterMiddleware(Config{
		RequestsPerMinute: 100,
		Burst:             100,
	})
}