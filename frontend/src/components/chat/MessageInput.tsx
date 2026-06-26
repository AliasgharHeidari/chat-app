import React, { useState, useRef, useEffect } from "react";
import { validators } from "@/utils/validators";
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
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTyping = (value: string) => {
    setText(value);
    setError(null);

    // Notify about typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping?.(true);
    }

    // Reset typing timeout
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
  };

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.inputWrapper}>
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
    </form>
  );
};
