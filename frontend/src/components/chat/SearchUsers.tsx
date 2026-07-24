import React, { useState, useCallback } from "react";
import type { SearchUsersResponse } from "@/types";
import { useChat } from "@/hooks/useChat";
import { Avatar } from "@/components/common/Avatar";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import styles from "./SearchUsers.module.css";

interface SearchUsersProps {
  onChatCreated?: () => void;
  onClose?: () => void;
}

export const SearchUsers: React.FC<SearchUsersProps> = ({
  onChatCreated,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const { searchResults, isLoadingChats, searchUsers, initChat } = useChat();
  const [isInitiatingChat, setIsInitiatingChat] = useState<number | null>(null);

  const handleSearch = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      if (value.trim()) {
        await searchUsers(value);
      }
    },
    [searchUsers],
  );

  const handleInitChat = async (user: SearchUsersResponse) => {
    setIsInitiatingChat(user.id);
    try {
      await initChat(user.username);
      onChatCreated?.();
      setQuery("");
    } catch (error) {
      console.error("Failed to initiate chat:", error);
    } finally {
      setIsInitiatingChat(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Start New Chat</h2>
        {onClose && (
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        )}
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search by username..."
          value={query}
          onChange={handleSearch}
          autoFocus
          className={styles.searchInput}
        />
      </div>

      <div className={styles.resultsContainer}>
        {isLoadingChats ? (
          <div className={styles.center}>
            <LoadingSpinner size="small" />
          </div>
        ) : searchResults.length === 0 && query ? (
          <div className={styles.empty}>
            <p>No users found</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className={styles.empty}>
            <p>Search for users to start chatting</p>
          </div>
        ) : (
          searchResults.map((user) => (
            <div key={user.id} className={styles.resultItem}>
              <Avatar
                size="medium"
                initials={`${user.first_name[0]}${user.last_name[0]}`.toUpperCase()}
                isOnline={user.is_online}
              />
              <div className={styles.userInfo}>
                <h3 className={styles.userName}>
                  {user.first_name} {user.last_name}
                </h3>
                <p className={styles.username}>@{user.username}</p>
                {user.bio && <p className={styles.bio}>{user.bio}</p>}
              </div>
              <button
                onClick={() => handleInitChat(user)}
                disabled={isInitiatingChat === user.id}
                className={styles.startButton}
              >
                {isInitiatingChat === user.id ? (
                  <LoadingSpinner size="small" />
                ) : (
                  "Message"
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
