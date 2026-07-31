// frontend/src/components/chat/MessageInput.tsx
import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { validators } from "@/utils/validators";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { getSelfHostedEmojiUrl } from "@/utils/emojiAssets";
import { EmojiText } from "@/utils/EmojiText";
import { detectTextDirection } from "@/utils/direction";
import { wsManager } from "@/api/socket"; // 🔥 جدید - برای گوش دادن به خطای سرور
import styles from "./MessageInput.module.css";

const MemoizedEmojiText = memo(EmojiText);

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  isLoading?: boolean;
}

// چند ثانیه‌ای که منتظر می‌مونیم ببینیم آیا سرور خطا برمی‌گردونه یا نه.
// اگه ظرف این بازه خطایی نیاد، یعنی ارسال موفق بوده و دیگه چیزی رو
// بازگردانی نمی‌کنیم (جلوگیری از بازگردانی اشتباهیِ متنِ جدیدی که
// کاربر شروع به تایپش کرده).
const PENDING_SEND_TIMEOUT = 4000;

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  isLoading = false,
}) => {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") === "dark",
  );
  const [direction, setDirection] = useState<"rtl" | "ltr">("ltr");

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  // 🔥 جدید: نگه‌داشتن متنی که همین الان ارسال شده ولی هنوز تأیید نشده
  const pendingSentTextRef = useRef<string | null>(null);
  const pendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDirection(detectTextDirection(text));
  }, [text]);

  useEffect(() => {
    const target = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDarkTheme(target.getAttribute("data-theme") === "dark");
    });
    observer.observe(target, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔥 جدید: اگه سرور برای همین ارسال اخیر خطا برگردوند (مثلاً ریت‌لیمیت)،
  // متنی که پاک کرده بودیم رو برمی‌گردونیم به باکس تایپ.
  useEffect(() => {
    const unsubError = wsManager.on("error", () => {
      if (pendingSentTextRef.current === null) {
        // هیچ ارسال در انتظار تأییدی نداریم، این خطا ربطی به ما نداره
        return;
      }

      const restoredText = pendingSentTextRef.current;
      pendingSentTextRef.current = null;
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
        pendingTimeoutRef.current = null;
      }

      setText(restoredText);
      if (inputRef.current) {
        inputRef.current.innerText = restoredText;
        inputRef.current.focus();
        // کرسر رو انتهای متن ببر
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(inputRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    });

    return () => {
      unsubError();
      if (pendingTimeoutRef.current) {
        clearTimeout(pendingTimeoutRef.current);
      }
    };
  }, []);

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    isTypingRef.current = false;
    onTyping?.(false);
  }, [onTyping]);

  const handleTyping = useCallback(
    (value: string) => {
      setText(value);
      setError(null);
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTyping?.(true);
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(stopTyping, 1000);
    },
    [onTyping, stopTyping],
  );

  const sendMessage = useCallback(() => {
    const validationError = validators.messageText(text);
    if (validationError) {
      setError(validationError);
      return;
    }

    const sentText = text.trim();
    onSendMessage(sentText);

    // 🔥 قبل از پاک کردن باکس، متن رو به‌عنوان "در انتظار تأیید" نگه می‌داریم.
    // اگه سرور ظرف چند ثانیه خطا برگردونه (مثلاً ریت‌لیمیت)، همینو برمی‌گردونیم.
    pendingSentTextRef.current = sentText;
    if (pendingTimeoutRef.current) clearTimeout(pendingTimeoutRef.current);
    pendingTimeoutRef.current = setTimeout(() => {
      // اگه ظرف این بازه خطایی نیومد، یعنی ارسال موفق بوده؛ دیگه نیازی
      // به نگه‌داشتنش نیست.
      pendingSentTextRef.current = null;
      pendingTimeoutRef.current = null;
    }, PENDING_SEND_TIMEOUT);

    setText("");
    stopTyping();
    setShowEmojiPicker(false);
    if (inputRef.current) {
      inputRef.current.innerText = "";
      inputRef.current.focus();
    }
  }, [text, onSendMessage, stopTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const onEmojiClick = useCallback(
    (emojiData: any) => {
      const inputEl = inputRef.current;
      if (!inputEl || isLoading) return;
      const newText = text + emojiData.emoji;
      setText(newText);
      inputEl.innerText = newText;
      inputEl.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(inputEl);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    },
    [text, isLoading],
  );

  const fontFamily = direction === "rtl" ? "Vazirmatn, sans-serif" : "Inter, sans-serif";

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.inputWrapper}>
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={styles.emojiButton}
          aria-label="Add emoji"
        >
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
            <circle cx="50" cy="50" r="42" />
            <circle cx="35" cy="42" r="3" fill="currentColor" stroke="none" />
            <circle cx="65" cy="42" r="3" fill="currentColor" stroke="none" />
            <path d="M 32 58 Q 50 76 68 58" strokeLinecap="round" />
          </svg>
        </button>

        <div className={styles.inputContainer}>
          <div
            ref={inputRef}
            className={styles.hiddenInput}
            dir="auto"
            style={{ fontFamily }}
            contentEditable={!isLoading}
            onInput={(e) => handleTyping(e.currentTarget.innerText || "")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            suppressContentEditableWarning
          />
          <div
            className={styles.inputText}
            dir="auto"
            style={{
              textAlign: direction === "rtl" ? "right" : "left",
              fontFamily,
            }}
            aria-hidden="true"
          >
            <MemoizedEmojiText text={text} size={20} />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className={styles.sendButton}
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.4 20.6 21 12 3.4 3.4 3.4 10l12 2-12 2z" fill="currentColor" />
          </svg>
        </button>
      </div>

      {showEmojiPicker && (
        <div ref={pickerRef} className={styles.emojiPickerContainer}>
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            emojiStyle={EmojiStyle.APPLE}
            theme={isDarkTheme ? Theme.DARK : Theme.LIGHT}
            getEmojiUrl={(unified) => getSelfHostedEmojiUrl(unified)}
            searchPlaceholder="Search emoji..."
            previewConfig={{ showPreview: true, defaultEmoji: "😊" }}
          />
        </div>
      )}
    </form>
  );
};