import React, { useEffect, useRef, useState } from "react";
import type { Message } from "@/types";
import { MessageItem } from "./MessageItem";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { formatLongDate, isToday, isYesterday } from "@/utils/dateFormatter";
import styles from "./MessageList.module.css";

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  isLoading?: boolean;
  isSelectMode?: boolean;
  selectedMessages?: Set<number>;
  onToggleSelect?: (messageId: number) => void;
  onEdit?: (messageId: number, newText: string) => void;
  onDelete?: (messageId: number, forEveryone: boolean) => void;
  onSeen?: (messageId: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onCopyMessage?: (text: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isLoading = false,
  isSelectMode = false,
  selectedMessages = new Set(),
  onToggleSelect,
  onEdit,
  onDelete,
  onSeen,
  onLoadMore,
  hasMore = false,
  onCopyMessage,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const seenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingMoreRef = useRef(false);
  const prevScrollHeightRef = useRef(0);

  // ✅ فقط یه منوی action در کل لیست می‌تونه هم‌زمان باز باشه.
  // قبلاً هر MessageItem یه state محلی مستقل داشت (showMenu) که باعث
  // می‌شد چندتا منو هم‌زمان باز بشن. حالا این state اینجا (والد مشترک)
  // نگه داشته می‌شه و id پیامی که منوش بازه رو ذخیره می‌کنه.
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      const scrollHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTop = scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && onSeen) {
      const unseenMessages = messages.filter(
        (msg) => msg.sender_id !== currentUserId && msg.status !== "seen",
      );
      if (unseenMessages.length > 0) {
        if (seenTimeoutRef.current) {
          clearTimeout(seenTimeoutRef.current);
        }
        seenTimeoutRef.current = setTimeout(() => {
          unseenMessages.forEach((msg) => {
            onSeen(msg.id);
          });
        }, 500);
      }
    }
    return () => {
      if (seenTimeoutRef.current) {
        clearTimeout(seenTimeoutRef.current);
      }
    };
  }, [messages, currentUserId, onSeen]);

  // ✅ به‌محض ورود به حالت انتخاب، هر منوی بازی رو ببند
  // (تو حالت انتخاب اصلاً نباید action menu کار کنه)
  useEffect(() => {
    if (isSelectMode) {
      setOpenMenuId(null);
    }
  }, [isSelectMode]);

  const handleScroll = () => {
    if (!containerRef.current || isLoading || !onLoadMore || !hasMore) return;
    if (isLoadingMoreRef.current) return;
    const { scrollTop } = containerRef.current;
    if (scrollTop < 50) {
      isLoadingMoreRef.current = true;
      prevScrollHeightRef.current = containerRef.current.scrollHeight;
      onLoadMore();
      setTimeout(() => {
        isLoadingMoreRef.current = false;
      }, 1000);
    }
  };

  useEffect(() => {
    if (isLoadingMoreRef.current && containerRef.current) {
      const newScrollHeight = containerRef.current.scrollHeight;
      const diff = newScrollHeight - prevScrollHeightRef.current;
      containerRef.current.scrollTop = diff > 0 ? diff : 0;
    }
  }, [messages]);

  const getDateLabel = (dateString: string): string => {
    if (isToday(dateString)) return "Today";
    if (isYesterday(dateString)) return "Yesterday";
    return formatLongDate(dateString);
  };

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    msgs.forEach((msg) => {
      const date = msg.created_at.split("T")[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return Object.entries(groups).map(([date, msgs]) => ({
      date,
      messages: msgs,
    }));
  };

  const groupedMessages = groupMessagesByDate(messages);

  if (isLoading && messages.length === 0) {
    return (
      <div className={styles.center}>
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className={styles.container} ref={containerRef} onScroll={handleScroll}>
      {isLoading && hasMore && (
        <div className={styles.loadingMore}>
          <LoadingSpinner size="small" />
        </div>
      )}
      {groupedMessages.map((group) => (
        <div key={group.date}>
          <div className={styles.dateLabel}>
            {getDateLabel(group.messages[0].created_at)}
          </div>
          {group.messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwn={message.sender_id === currentUserId}
              currentUserId={currentUserId}
              showAvatar={false}
              isSelectMode={isSelectMode}
              isSelected={selectedMessages.has(message.id)}
              onToggleSelect={onToggleSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onCopy={onCopyMessage}
              isMenuOpen={openMenuId === message.id}
              onOpenMenuChange={setOpenMenuId}
            />
          ))}
        </div>
      ))}
    </div>
  );
};