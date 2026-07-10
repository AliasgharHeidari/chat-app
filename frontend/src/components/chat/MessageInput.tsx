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
          <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="white" stroke-width="4">
  <circle cx="50" cy="50" r="42"/>
  <circle cx="35" cy="42" r="3" fill="white" stroke="none"/>
  <circle cx="65" cy="42" r="3" fill="white" stroke="none"/>
  <path d="M 32 58 Q 50 76 68 58" stroke-linecap="round"/>
</svg>
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
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3.4 20.6 21 12 3.4 3.4 3.4 10l12 2-12 2z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
      {showEmojiPicker && (
        <div ref={pickerRef} className={styles.emojiPickerContainer}>
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            emojiStyle={EmojiStyle.APPLE}
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