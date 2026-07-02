import React, { useEffect, useRef } from "react";
import type { Message } from "@/types";
import { MessageItem } from "./MessageItem";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { formatLongDate, isToday, isYesterday } from "@/utils/dateFormatter";
import styles from "./MessageList.module.css";

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  isLoading?: boolean;
  onEdit?: (messageId: number, newText: string) => void;
  onDelete?: (messageId: number, forEveryone: boolean) => void;
  onSeen?: (messageId: number) => void;
  onLoadMore?: () => void; // ✅ اضافه شد
  hasMore?: boolean; // ✅ اضافه شد
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isLoading = false,
  onEdit,
  onDelete,
  onSeen,
  onLoadMore, // ✅ اضافه شد
  hasMore = false, // ✅ اضافه شد
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const seenTimeoutRef = useRef<number | null>(null);
  const isLoadingMoreRef = useRef(false);
  const prevScrollHeightRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      const scrollHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTop = scrollHeight;
    }
  }, [messages]);

  // وقتی پیام جدید میاد، تمام پیام‌های دیده نشده رو seen کن
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

  // ✅ تشخیص اسکرول به بالا
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

  // ✅ بعد از لود پیام‌های جدید، اسکرول رو در موقعیت قبلی نگه دار
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
    <div 
      className={styles.container} 
      ref={containerRef}
      onScroll={handleScroll} // ✅ اضافه شد
    >
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
          {group.messages.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwn={message.sender_id === currentUserId}
              currentUserId={currentUserId}
              showAvatar={
                index === 0 ||
                group.messages[index - 1].sender_id !== message.sender_id
              }
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ))}
    </div>
  );
};