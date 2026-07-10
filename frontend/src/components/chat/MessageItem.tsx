import React from "react";
import type { Message } from "@/types";
import { formatTime } from "@/utils/dateFormatter";
import { Avatar } from "@/components/common/Avatar";
import styles from "./MessageItem.module.css";

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  currentUserId: number;
  showAvatar?: boolean;
  onEdit?: (messageId: number, newText: string) => void;
  onDelete?: (messageId: number, forEveryone: boolean) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwn,
  currentUserId,
  showAvatar = false,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(message.message_text);
  const [showMenu, setShowMenu] = React.useState(false);

  // ✅ اگر پیام برای کاربر فعلی حذف شده، نشون نده
  if (message.deleted_for && message.deleted_for === currentUserId) {
    return null;
  }

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
    <div className={containerClass}>
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
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            <p className={styles.messageText}>
              {message.is_deleted ? (
                <em>This message was deleted</em>
              ) : (
                message.message_text
              )}
            </p>

            <div className={styles.metaRow}>
              {message.is_edited && !message.is_deleted && (
                <span className={styles.edited}>edited</span>
              )}
              <span className={styles.time}>
                {formatTime(message.created_at)}
              </span>
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

            {showMenu && isOwn && !message.is_deleted && (
              <div className={styles.menu}>
                <button
                  onClick={() => setIsEditing(true)}
                  className={styles.menuItem}
                >
                  Edit
                </button>
                <div className={styles.deleteGroup}>
                  <button
                    onClick={() => onDelete?.(message.id, true)}
                    className={styles.menuItemDanger}
                  >
                    Delete for everyone
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};