import React, { useState, useRef, useEffect } from "react";
import type { Message } from "@/types";
import { formatTime } from "@/utils/dateFormatter";
import { Avatar } from "@/components/common/Avatar";
import { EmojiText } from "@/utils/EmojiText";
import { detectTextDirection } from "@/utils/direction";
import styles from "./MessageItem.module.css";

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  currentUserId: number;
  showAvatar?: boolean;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (messageId: number) => void;
  onEdit?: (messageId: number, newText: string) => void;
  onDelete?: (messageId: number, forEveryone: boolean) => void;
  onCopy?: (text: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  currentUserId,
  showAvatar = false,
  isSelectMode = false,
  isSelected = false,
  onToggleSelect,
  onEdit,
  onDelete,
  onCopy,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message_text);
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (message.deleted_for && message.deleted_for === currentUserId) {
    return null;
  }

  const direction = detectTextDirection(message.message_text);
  const fontFamily = direction === "rtl" ? "Vazirmatn, Tahoma, sans-serif" : "Inter, sans-serif";
  const textAlign = direction === "rtl" ? "right" : "left";

  const handleClick = () => {
    if (isSelectMode) {
      onToggleSelect?.(message.id);
      return;
    }
    setShowMenu(true);
    setTimeout(() => setShowMenu(false), 4000);
  };

  const handleMouseDown = () => {
    if (isSelectMode) return;
    longPressTimer.current = setTimeout(() => {
      onToggleSelect?.(message.id);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleCopy = () => {
    onCopy?.(message.message_text);
    setShowMenu(false);
  };

  const handleEditSubmit = () => {
    if (editText.trim() && editText !== message.message_text) {
      onEdit?.(message.id, editText);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(message.message_text);
    setIsEditing(false);
  };

  const containerClass = isOwn
    ? `${styles.container} ${styles.own}`
    : `${styles.container} ${styles.other}`;

  return (
    <div
      className={`${containerClass} ${isSelectMode ? styles.selectable : ""} ${
        isSelected ? styles.selected : ""
      }`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {isSelectMode && (
        <div className={styles.checkboxWrapper}>
          <div className={`${styles.checkbox} ${isSelected ? styles.checked : ""}`}>
            {isSelected && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>
      )}

      {showAvatar && !isOwn && (
        <Avatar size="small" initials={message.sender_name?.charAt(0) || "U"} />
      )}

      <div className={styles.messageContent}>
        {isEditing ? (
          <div className={styles.editContainer}>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className={styles.editInput}
              autoFocus
            />
            <div className={styles.editButtons}>
              <button onClick={handleEditSubmit} className={styles.saveBtn}>
                Save
              </button>
              <button onClick={handleCancel} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`${styles.messageBubble} ${isOwn ? styles.ownBubble : styles.otherBubble}`}
          >
            <p
              className={styles.messageText}
              style={{ direction, textAlign, fontFamily }}
            >
              {message.is_deleted ? (
                <em>This message was deleted</em>
              ) : (
                <EmojiText text={message.message_text} size={18} />
              )}
            </p>

            <div className={styles.metaRow}>
              {message.is_edited && !message.is_deleted && (
                <span className={styles.edited}>edited</span>
              )}
              <span className={styles.time}>{formatTime(message.created_at)}</span>
              {isOwn && (
                <span className={styles.status}>
                  {message.status === "seen"
                    ? "✓✓"
                    : message.status === "delivered"
                      ? "✓✓"
                      : "✓"}
                </span>
              )}
            </div>

            {showMenu && isOwn && !message.is_deleted && !isSelectMode && (
              <div className={styles.menu}>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`${styles.menuItem} ${styles.editItem}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                  Edit
                </button>
                <button onClick={handleCopy} className={`${styles.menuItem} ${styles.copyItem}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy
                </button>
                <button
                  onClick={() => onDelete?.(message.id, true)}
                  className={`${styles.menuItem} ${styles.deleteItem}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};