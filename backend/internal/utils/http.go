// backend/internal/utils/http.go
package utils

import (
	"net/http"
	"time"
)

// HTTPClientWithTimeout ایجاد کلاینت HTTP با تایم‌اوت
func HTTPClientWithTimeout(timeout time.Duration) *http.Client {
	return &http.Client{
		Timeout: timeout,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 5 {
				return http.ErrUseLastResponse
			}
			return nil
		},
	}
}