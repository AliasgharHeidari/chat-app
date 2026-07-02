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
  onSeen?: (messageId: number) => void; // ✅ اضافه شد
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isLoading = false,
  onEdit,
  onDelete,
  onSeen, // ✅ اضافه شد
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const seenTimeoutRef = useRef<number | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      const scrollHeight = containerRef.current.scrollHeight;
      containerRef.current.scrollTop = scrollHeight;
    }
  }, [messages]);

  // ✅ وقتی پیام جدید میاد، تمام پیام‌های دیده نشده رو seen کن
  useEffect(() => {
    if (messages.length > 0 && onSeen) {
      // تمام پیام‌های دیده نشده از کاربر دیگر رو پیدا کن
      const unseenMessages = messages.filter(
        (msg) => msg.sender_id !== currentUserId && msg.status !== "seen",
      );

      if (unseenMessages.length > 0) {
        // با تأخیر کوچک برای جلوگیری از ارسال همزمان
        if (seenTimeoutRef.current) {
          clearTimeout(seenTimeoutRef.current);
        }
        seenTimeoutRef.current = setTimeout(() => {
          // تمام پیام‌های دیده نشده رو mark کن
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
    <div className={styles.container} ref={containerRef}>
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
