import React, { useState, useRef, useEffect } from "react";
import { validators } from "@/utils/validators";
import EmojiPicker, { EmojiStyle } from "emoji-picker-react";
import styles from "./MessageInput.module.css";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  isLoading?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTyping,
  isLoading = false,
}) => {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // بستن پنل با کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTyping = (value: string) => {
    setText(value);
    setError(null);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping?.(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTyping?.(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validators.messageText(text);
    if (error) {
      setError(error);
      return;
    }
    onSendMessage(text.trim());
    setText("");
    isTypingRef.current = false;
    onTyping?.(false);
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiData: any) => {
    setText((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

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
          😊
        </button>

        <textarea
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
          className={styles.input}
          rows={1}
        />

        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className={styles.sendButton}
        >
          <span>Send</span>
        </button>
      </div>

      {showEmojiPicker && (
        <div ref={pickerRef} className={styles.emojiPickerContainer}>
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            emojiStyle={EmojiStyle.APPLE} // ✅ استایل iOS
            searchPlaceholder="Search emoji..."
            previewConfig={{
              showPreview: true,
              defaultEmoji: "😊",
            }}
          />
        </div>
      )}
    </form>
  );
};