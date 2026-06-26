import React, { useState } from "react";
import { useChat } from "@/hooks/useChat";
import type { Chat } from "@/types";
import { Avatar } from "@/components/common/Avatar";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import styles from "./UserList.module.css";

interface UserListProps {
  chats: Chat[];
  currentChat: Chat | null;
  currentUserId: number;
  isLoading?: boolean;
  onChatSelect: (chat: Chat) => void;
  onNewChat?: () => void;
}

export const UserList: React.FC<UserListProps> = ({
  chats,
  currentChat,
  currentUserId,
  isLoading = false,
  onChatSelect,
  onNewChat,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) => {
    const otherUser = chat.user1_id === currentUserId ? chat.user2 : chat.user1;
    if (!otherUser) return false;
    const fullName =
      `${otherUser.first_name} ${otherUser.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const { isUserOnline } = useChat();

  const getChatName = (chat: Chat) => {
    const otherUser = chat.user1_id === currentUserId ? chat.user2 : chat.user1;
    return otherUser
      ? `${otherUser.first_name} ${otherUser.last_name}`
      : "Unknown User";
  };

  const getChatInitials = (chat: Chat) => {
    const otherUser = chat.user1_id === currentUserId ? chat.user2 : chat.user1;
    if (!otherUser) return "U";
    return `${otherUser.first_name[0]}${otherUser.last_name[0]}`.toUpperCase();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chats</h1>
        <button
          onClick={onNewChat}
          className={styles.newChatButton}
          title="Start new chat"
        >
          +
        </button>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.listContainer}>
        {isLoading && chats.length === 0 ? (
          <div className={styles.center}>
            <LoadingSpinner size="small" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className={styles.empty}>
            <p>No chats yet</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`${styles.chatItem} ${
                currentChat?.id === chat.id ? styles.active : ""
              }`}
              onClick={() => onChatSelect(chat)}
            >
              <Avatar
                size="medium"
                initials={getChatInitials(chat)}
                isOnline={isUserOnline(
                  (chat.user1_id === currentUserId ? chat.user2 : chat.user1)
                    ?.id || 0,
                )}
              />
              <div className={styles.chatInfo}>
                <h3 className={styles.chatName}>{getChatName(chat)}</h3>
                <p className={styles.chatPreview}>Tap to open</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
