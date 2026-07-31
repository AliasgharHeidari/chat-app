package rateLimiter

import (
	"strconv"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
)

// LockoutConfig تنظیمات محدودکننده‌ی «قفل کامل بعد از N درخواست»
type LockoutConfig struct {
	MaxRequests     int           // تعداد درخواست مجاز قبل از قفل‌شدن (مثلاً 10)
	LockoutDuration time.Duration // مدت قفل کامل بعد از رسیدن به سقف (مثلاً 5*time.Minute)
}

// lockoutState وضعیت هر IP
type lockoutState struct {
	count       int
	lockedUntil time.Time
}

// LockoutLimiter برخلاف IPRateLimiter (که token bucket و تدریجیه)،
// این یکی دقیقاً رفتار «N درخواست، بعدش قفل کامل به مدت X» رو پیاده می‌کنه.
type LockoutLimiter struct {
	mu      sync.Mutex
	clients map[string]*lockoutState
	cfg     LockoutConfig
}

// NewLockoutLimiter یه LockoutLimiter جدید می‌سازه و یه goroutine
// پاک‌سازی پس‌زمینه براش راه می‌ندازه (جلوگیری از نشت حافظه).
func NewLockoutLimiter(cfg LockoutConfig) *LockoutLimiter {
	ll := &LockoutLimiter{
		clients: make(map[string]*lockoutState),
		cfg:     cfg,
	}
	go ll.cleanupLoop()
	return ll
}

// cleanupLoop هر LockoutDuration یه‌بار، IP هایی که قفلشون تموم
// شده رو از حافظه پاک می‌کنه.
func (ll *LockoutLimiter) cleanupLoop() {
	ticker := time.NewTicker(ll.cfg.LockoutDuration)
	defer ticker.Stop()

	for range ticker.C {
		ll.mu.Lock()
		now := time.Now()
		for ip, state := range ll.clients {
			if !state.lockedUntil.IsZero() && now.After(state.lockedUntil) {
				delete(ll.clients, ip)
			}
		}
		ll.mu.Unlock()
	}
}

// allow بررسی می‌کنه آیا این IP اجازه‌ی درخواست جدید داره.
// اگه رد بشه، مدت باقی‌مونده تا پایان قفل رو هم برمی‌گردونه.
func (ll *LockoutLimiter) allow(ip string) (bool, time.Duration) {
	ll.mu.Lock()
	defer ll.mu.Unlock()

	now := time.Now()
	state, exists := ll.clients[ip]
	if !exists {
		state = &lockoutState{}
		ll.clients[ip] = state
	}

	// هنوز تو دوره‌ی قفله
	if now.Before(state.lockedUntil) {
		return false, state.lockedUntil.Sub(now)
	}

	// قفل قبلی (اگه بوده) تموم شده - یه دور جدید شروع می‌شه
	if !state.lockedUntil.IsZero() {
		state.count = 0
		state.lockedUntil = time.Time{}
	}

	state.count++
	if state.count > ll.cfg.MaxRequests {
		state.lockedUntil = now.Add(ll.cfg.LockoutDuration)
		return false, ll.cfg.LockoutDuration
	}

	return true, 0
}

// Middleware یه fiber.Handler برمی‌گردونه که می‌شه مستقیم رو یه route گذاشت.
func (ll *LockoutLimiter) Middleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		ip := c.IP()
		allowed, retryAfter := ll.allow(ip)

		if !allowed {
			seconds := int(retryAfter.Seconds())
			c.Set("Retry-After", strconv.Itoa(seconds))
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error":                "Too Many Requests, try again later",
				"message":              "You've made too many requests. Please try again later.",
				"retry_after_seconds": seconds,
			})
		}

		return c.Next()
	}
}

