import React, { useState, useEffect } from "react";
import type { Chat } from "@/types";
import { MessageList } from "./MessageList";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/store/chatStore";
import { useSocket } from "@/hooks/useSocket";
import { MessageInput } from "./MessageInput";
import { UserStatus } from "./UserStatus";
import { TypingIndicator } from "./TypingIndicator";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { api } from "@/api/rest";
import styles from "./ChatContainer.module.css";

interface ChatContainerProps {
  chat: Chat;
  currentUserId: number;
  typingUsers: Set<number>;
  onSendMessage: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
  onEditMessage?: (messageId: number, newText: string) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  chat,
  currentUserId,
  typingUsers,
  onSendMessage,
  onTyping,
  onEditMessage,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [offset, setOffset] = useState(20);

  const messages = useChatStore((state) => state.messages[chat.id] || []);
  const isLoadingMessages = useChatStore((state) => state.isLoadingMessages);
  const loadChatMessages = useChatStore((state) => state.loadChatMessages);
  const { markAsSeen } = useSocket();

  useEffect(() => {
    if (chat?.id) {
      setOffset(20);
      loadChatMessages(chat.id, 20, 0);
    }
  }, [chat?.id, loadChatMessages]);

  const handleLoadMore = () => {
    if (!chat?.id || isLoadingMessages) return;
    loadChatMessages(chat.id, 20, offset);
    setOffset(offset + 20);
  };

  const otherUser = chat.user1_id === currentUserId ? chat.user2 : chat.user1;
  const otherUserInitials = otherUser
    ? `${otherUser.first_name[0]}${otherUser.last_name[0]}`.toUpperCase()
    : "U";
  const otherUserName = otherUser
    ? `${otherUser.first_name} ${otherUser.last_name}`
    : "Unknown User";

  const typingUserNames: string[] = [];
  Array.from(typingUsers).forEach((userId) => {
    if (userId !== currentUserId) {
      typingUserNames.push(otherUserName);
    }
  });

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    setIsSending(true);
    try {
      onSendMessage(text);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleEditMessage = async (messageId: number, newText: string) => {
    try {
      await api.editMessage(messageId, { new_text: newText });
      onEditMessage?.(messageId, newText);
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: number, forEveryone = false) => {
    const ok = confirm(
      forEveryone
        ? "Delete this message for everyone?"
        : "Delete this message for me?"
    );
    if (!ok) return;
    try {
      await api.deleteMessage(messageId, { delete_for_everyone: forEveryone });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  if (!otherUser) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  const { isUserOnline } = useChat();
  const otherIsOnline = otherUser ? isUserOnline(otherUser.id) : false;

  const hasMore = messages.length >= offset && messages.length > 0;

  return (
    <div className={styles.container}>
      <UserStatus
        name={otherUserName}
        isOnline={otherIsOnline}
        lastSeen={otherUser.last_seen}
        initials={otherUserInitials}
        profilePicUrl={otherUser.profile_pic_url}
      />

      <TypingIndicator userNames={typingUserNames} />

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isLoading={isLoadingMessages}
        onEdit={handleEditMessage}
        onDelete={handleDeleteMessage}
        onSeen={markAsSeen}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
      
      {/* ✅ MessageInput همیشه نمایش داده میشه */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={onTyping}
        isLoading={isSending}
      />
    </div>
  );
};