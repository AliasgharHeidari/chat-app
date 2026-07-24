// frontend/src/components/chat/MessageItem.tsx
import React, { useState, useRef, useEffect } from "react";
import type { Message } from "@/types";
import { formatTime } from "@/utils/dateFormatter";
import { Avatar } from "@/components/common/Avatar";
import { EmojiText } from "@/utils/EmojiText";
import { detectTextDirection } from "@/utils/direction";
import styles from "./MessageItem.module.css";

interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  image: string;
  site_name: string;
  favicon: string;
}

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
  isMenuOpen?: boolean;
  onOpenMenuChange?: (messageId: number | null) => void;
}

// 🔥 کامپوننت Link Preview Card
const LinkPreviewCard: React.FC<{ preview: LinkPreviewData }> = ({ preview }) => {
  if (!preview) return null;

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.linkPreview}
      onClick={(e) => e.stopPropagation()}
    >
      {preview.image && (
        <div className={styles.linkImage}>
          <img src={preview.image} alt={preview.title || "Link preview"} />
        </div>
      )}
      <div className={styles.linkContent}>
        {preview.favicon && (
          <img src={preview.favicon} alt="" className={styles.linkFavicon} />
        )}
        {preview.title && (
          <div className={styles.linkTitle}>{preview.title}</div>
        )}
        {preview.description && (
          <div className={styles.linkDescription}>{preview.description}</div>
        )}
        <div className={styles.linkSite}>{preview.site_name || preview.url}</div>
      </div>
    </a>
  );
};

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
  isMenuOpen = false,
  onOpenMenuChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message_text);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  if (message.deleted_for && message.deleted_for === currentUserId) {
    return null;
  }

  const direction = detectTextDirection(message.message_text);
  const fontFamily =
    direction === "rtl"
      ? "var(--font-fa), var(--font-emoji)"
      : "var(--font-en), var(--font-emoji)";
  const textAlign = direction === "rtl" ? "right" : "left";

  const editDirection = detectTextDirection(editText);
  const editFontFamily =
    editDirection === "rtl"
      ? "var(--font-fa), var(--font-emoji)"
      : "var(--font-en), var(--font-emoji)";
  const editTextAlign = editDirection === "rtl" ? "right" : "left";

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(event.target as Node)) {
        onOpenMenuChange?.(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, onOpenMenuChange]);

  const handleClick = () => {
    if (isSelectMode) {
      onToggleSelect?.(message.id);
      return;
    }
    onOpenMenuChange?.(isMenuOpen ? null : message.id);
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
    onOpenMenuChange?.(null);
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
              dir={editDirection}
              style={{
                direction: editDirection,
                textAlign: editTextAlign,
                fontFamily: editFontFamily,
              }}
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
            ref={bubbleRef}
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

            {/* 🔥 Link Preview */}
            {!message.is_deleted && message.link_preview && (
              <LinkPreviewCard preview={message.link_preview} />
            )}

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

            {isMenuOpen && isOwn && !message.is_deleted && !isSelectMode && (
              <div
                className={styles.menu}
                onClick={(e) => e.stopPropagation()}
              >
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