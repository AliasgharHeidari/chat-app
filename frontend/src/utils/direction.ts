// src/utils/direction.ts

/**
 * تشخیص جهت (دستور) متن بر اساس اولین کاراکتر قوی (مانند تلگرام)
 * @param text - متن مورد نظر برای بررسی
 * @returns 'rtl' یا 'ltr'
 */
export function detectTextDirection(text: string): 'rtl' | 'ltr' {
    // 1. اگر متن خالی است، پیش‌فرض 'ltr' (چپ‌چین)
    if (!text) {
        return 'ltr';
    }

    // 2. الگوی تشخیص حروف فارسی، عربی، عبری و... (دامنه یونیکد RTL)
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

    // 3. اولین کاراکتر غیر-فضای خالی (whitespace) را پیدا کن
    for (const char of text) {
        if (char.trim()) {
            // 4. بررسی کن که آیا کاراکتر متعلق به دامنه RTL است یا خیر
            return rtlRegex.test(char) ? 'rtl' : 'ltr';
        }
    }

    // در صورت پیدا نکردن کاراکتر غیر-فضای خالی، پیش‌فرض 'ltr' برگردان
    return 'ltr';
}