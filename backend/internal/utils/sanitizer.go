package utils

import "html"


func SanitizeInput(input string) string {
    // تبدیل کاراکترهای خطرناک به معادل HTML-safe
    return html.EscapeString(input)
}

// SanitizeMessage پاکسازی پیام (با حفظ لینک‌ها - اختیاری)
func SanitizeMessage(text string) string {
    // ۱. اول Escape کن
    sanitized := html.EscapeString(text)
    // ۲. (اختیاری) لینک‌ها رو به <a> تبدیل کن
    // این کار رو می‌تونی توی فرانت انجام بدی، پس فعلاً همین کافیه
    return sanitized
}