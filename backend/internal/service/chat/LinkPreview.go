package service

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/AliasgharHeidari/chat-app/internal/model"
	chat "github.com/AliasgharHeidari/chat-app/internal/repository/indatabase/chat"
	"github.com/AliasgharHeidari/chat-app/internal/utils"
	"github.com/PuerkitoBio/goquery"
)

type LinkPreviewService struct {
	httpClient *http.Client
}

func NewLinkPreviewService() *LinkPreviewService {
	return &LinkPreviewService{
		httpClient: utils.HTTPClientWithTimeout(5 * time.Second),
	}
}

func (s *LinkPreviewService) ExtractLinkPreview(rawURL string) (*model.LinkPreview, error) {
	// 🔥 ۱. اعتبارسنجی URL
	parsedURL, err := url.Parse(rawURL)
	if err != nil {
		return nil, errors.New("invalid URL")
	}

	if parsedURL.Scheme != "http" && parsedURL.Scheme != "https" {
		return nil, errors.New("only HTTP/HTTPS URLs are supported")
	}

	// 🔥 ۲. SSRF Protection - این اولین خط دفاعیه (قبل از هر درخواست)
	log.Printf("🔍 SSRF Check for: %s", rawURL)
	if err := utils.ValidateURLForSSRF(rawURL); err != nil {
		log.Printf("🚫 SSRF Blocked: %s - %v", rawURL, err)
		return nil, errors.New("access to this URL is not allowed")
	}

	// ۳. چک کردن کش
	cached, err := chat.GetCachedLinkPreview(rawURL)
	if err == nil && cached != nil {
		return &model.LinkPreview{
			URL:         cached.URL,
			Title:       cached.Title,
			Description: cached.Description,
			Image:       cached.Image,
			SiteName:    cached.SiteName,
			Favicon:     cached.Favicon,
		}, nil
	}

	// ۴. درخواست به صفحه
	resp, err := s.httpClient.Get(rawURL)
	if err != nil {
		return nil, errors.New("failed to fetch URL")
	}
	defer resp.Body.Close()

	// فقط محتوای HTML مجاز
	contentType := resp.Header.Get("Content-Type")
	if !strings.Contains(contentType, "text/html") {
		return nil, errors.New("not an HTML page")
	}

	// ۵. پارس کردن HTML
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, errors.New("failed to parse HTML")
	}

	// ۶. استخراج اطلاعات
	preview := s.extractOpenGraph(doc, rawURL)

	if preview.Title == "" {
		preview.Title = s.extractTitle(doc)
	}
	if preview.Description == "" {
		preview.Description = s.extractDescription(doc)
	}
	if preview.SiteName == "" {
		preview.SiteName = parsedURL.Hostname()
	}

	// ۷. ذخیره در کش
	go s.cachePreview(preview)

	return preview, nil
}

// extractOpenGraph استخراج تگ‌های Open Graph
func (s *LinkPreviewService) extractOpenGraph(doc *goquery.Document, rawURL string) *model.LinkPreview {
	preview := &model.LinkPreview{
		URL: rawURL,
	}

	// استخراج تگ‌های Open Graph
	doc.Find("meta").Each(func(i int, sel *goquery.Selection) {
		property, _ := sel.Attr("property")
		content, _ := sel.Attr("content")

		switch property {
		case "og:title":
			preview.Title = content
		case "og:description":
			preview.Description = content
		case "og:image":
			preview.Image = content
		case "og:site_name":
			preview.SiteName = content
		case "og:url":
			if content != "" {
				preview.URL = content
			}
		}
	})

	// استخراج favicon
	favicon := s.extractFavicon(doc, rawURL)
	preview.Favicon = favicon

	return preview
}

// extractTitle استخراج عنوان از تگ title
func (s *LinkPreviewService) extractTitle(doc *goquery.Document) string {
	title := doc.Find("title").Text()
	return strings.TrimSpace(title)
}

// extractDescription استخراج توضیحات از meta description
func (s *LinkPreviewService) extractDescription(doc *goquery.Document) string {
	var desc string
	doc.Find("meta[name='description']").Each(func(i int, sel *goquery.Selection) {
		content, _ := sel.Attr("content")
		if content != "" {
			desc = content
		}
	})
	return strings.TrimSpace(desc)
}

// extractFavicon استخراج آیکون سایت
func (s *LinkPreviewService) extractFavicon(doc *goquery.Document, rawURL string) string {
	var favicon string

	// ۱. چک کردن link با rel="icon" یا "shortcut icon"
	doc.Find("link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']").Each(func(i int, sel *goquery.Selection) {
		href, _ := sel.Attr("href")
		if href != "" && favicon == "" {
			favicon = href
		}
	})

	// ۲. اگر پیدا نشد، از /favicon.ico استفاده کن
	if favicon == "" {
		parsedURL, _ := url.Parse(rawURL)
		favicon = fmt.Sprintf("%s://%s/favicon.ico", parsedURL.Scheme, parsedURL.Hostname())
	}

	return favicon
}

// cachePreview ذخیره در کش
func (s *LinkPreviewService) cachePreview(preview *model.LinkPreview) {
	cached := &model.CachedLinkPreview{
		URL:         preview.URL,
		Title:       preview.Title,
		Description: preview.Description,
		Image:       preview.Image,
		SiteName:    preview.SiteName,
		Favicon:     preview.Favicon,
		ExpiresAt:   time.Now().Add(24 * time.Hour), // ۲۴ ساعت کش
	}

	// جلوگیری از خطا در پس‌زمینه
	_ = chat.SaveCachedLinkPreview(cached)
}