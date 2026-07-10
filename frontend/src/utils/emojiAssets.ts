// ✅ این فایل JSON مستقیم از پکیج ایمپورت میشه
import emojiData from "emoji-datasource-apple/emoji.json";

const EMOJI_BASE_PATH = "/emoji-assets/apple/64";

interface EmojiEntry {
  unified: string;
  non_qualified?: string | null;
  image: string;
  has_img_apple?: boolean;
  skin_variations?: Record<
    string,
    {
      unified: string;
      non_qualified?: string | null;
      image: string;
      has_img_apple?: boolean;
    }
  >;
}

// ✅ ساخت lookup map
const unifiedToImage: Record<string, string> = {};

(emojiData as EmojiEntry[]).forEach((entry) => {
  // فقط اموجی‌هایی که تصویر اپل دارن
  if (entry.has_img_apple === false) return;

  unifiedToImage[entry.unified.toLowerCase()] = entry.image;

  if (entry.non_qualified) {
    unifiedToImage[entry.non_qualified.toLowerCase()] = entry.image;
  }

  // ✅ اسکین ورژن‌های پوست
  if (entry.skin_variations) {
    Object.values(entry.skin_variations).forEach((variation) => {
      if (variation.has_img_apple === false) return;
      unifiedToImage[variation.unified.toLowerCase()] = variation.image;
      if (variation.non_qualified) {
        unifiedToImage[variation.non_qualified.toLowerCase()] = variation.image;
      }
    });
  }
});

// ✅ تابع getEmojiUrl برای پیکر و Emoji کامپوننت
export function getSelfHostedEmojiUrl(unified: string): string {
  const key = unified.toLowerCase();

  // ۱. تطبیق دقیق
  if (unifiedToImage[key]) {
    return `${EMOJI_BASE_PATH}/${unifiedToImage[key]}`;
  }

  // ۲. حذف fe0f
  const withoutVariation = key.replace(/-fe0f$/, "");
  if (unifiedToImage[withoutVariation]) {
    return `${EMOJI_BASE_PATH}/${unifiedToImage[withoutVariation]}`;
  }

  // ۳. فقط اولین کدپوینت (برای سکانس‌های نادر)
  const baseCodepoint = key.split("-")[0];
  if (unifiedToImage[baseCodepoint]) {
    return `${EMOJI_BASE_PATH}/${unifiedToImage[baseCodepoint]}`;
  }

  // ۴. fallback: تصویر شفاف محلی
  return `${EMOJI_BASE_PATH}/../missing.png`;
}