// backend/internal/utils/ssrf.go
package utils

import (
	"errors"
	"log"
	"net"
	"net/url"
	"strings"
)

// IsPrivateIP چک کردن IP خصوصی
func IsPrivateIP(ip net.IP) bool {
	return ip.IsLoopback() ||
		ip.IsPrivate() ||
		ip.IsLinkLocalUnicast() ||
		ip.IsLinkLocalMulticast() ||
		ip.IsUnspecified() ||
		ip.Equal(net.IPv4bcast) ||
		ip.IsMulticast()
}

// IsBannedDomain چک کردن دامنه‌های ممنوع
func IsBannedDomain(host string) bool {
	banned := []string{
		"localhost",
		"127.0.0.1",
		"0.0.0.0",
		"::1",
		"169.254.169.254",
		"metadata.google.internal",
		"100.100.100.200",
	}

	hostLower := strings.ToLower(host)
	for _, b := range banned {
		if strings.Contains(hostLower, b) {
			return true
		}
	}
	return false
}

// ValidateURLForSSRF اعتبارسنجی URL برای جلوگیری از SSRF
// backend/internal/utils/ssrf.go

func ValidateURLForSSRF(rawURL string) error {
    parsed, err := url.Parse(rawURL)
    if err != nil {
        return err
    }

    // فقط HTTP/HTTPS مجاز
    if parsed.Scheme != "http" && parsed.Scheme != "https" {
        return errors.New("only HTTP/HTTPS allowed")
    }

    host := parsed.Hostname()
    log.Printf("🔍 Validating host: %s", host) // ← این رو اضافه کن

    // دامنه‌های ممنوع
    if IsBannedDomain(host) {
        log.Printf("🚫 Banned domain: %s", host) // ← این رو اضافه کن
        return errors.New("banned domain")
    }

    // رزولوشن DNS و چک IP
    ips, err := net.LookupIP(host)
    if err != nil {
        log.Printf("❌ DNS lookup failed: %v", err) // ← این رو اضافه کن
        return err
    }

    for _, ip := range ips {
        log.Printf("🔍 IP: %s, IsPrivate: %v", ip, IsPrivateIP(ip)) // ← این رو اضافه کن
        if IsPrivateIP(ip) {
            return errors.New("private IP not allowed")
        }
    }

    return nil
}