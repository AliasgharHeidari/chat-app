import React, { useState, useCallback, useRef, useEffect } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const { searchResults, isLoadingChats, searchUsers, initChat } = useChat();
  const [isInitiatingChat, setIsInitiatingChat] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ✅ آیا یه جستجوی فعال (غیرخالی) در جریانه؟
  // این باعث می‌شه وقتی کاربر متن رو پاک می‌کنه، نتایج قبلی (که هنوز
  // تو searchResults هستن) دیگه نمایش داده نشن.
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setError(null);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!value.trim()) {
        return;
      }

      // ✅ debounce برای جلوگیری از spam کردن API روی هر کیبورد-پرس
      debounceRef.current = setTimeout(() => {
        searchUsers(value);
      }, 300);
    },
    [searchUsers],
  );

  const handleClearQuery = () => {
    setQuery("");
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const handleInitChat = async (user: SearchUsersResponse) => {
    setIsInitiatingChat(user.id);
    setError(null);
    try {
      await initChat(user.username);
      onChatCreated?.();
      setQuery("");
    } catch (err) {
      console.error("Failed to initiate chat:", err);
      setError("Couldn't start the chat. Please try again.");
    } finally {
      setIsInitiatingChat(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>New Chat</h2>
        {onClose && (
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.searchBox}>
        <svg
          className={styles.searchIcon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
          <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search by username..."
          value={query}
          onChange={handleSearch}
          autoFocus
          className={styles.searchInput}
        />
        {query && (
          <button
            type="button"
            onClick={handleClearQuery}
            className={styles.clearButton}
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.resultsContainer}>
        {!hasQuery ? (
          <div className={styles.empty}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.emptyIcon}>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.2-3.2" strokeLinecap="round" />
            </svg>
            <p>Search for a username to start chatting</p>
          </div>
        ) : isLoadingChats ? (
          <div className={styles.center}>
            <LoadingSpinner size="small" />
          </div>
        ) : searchResults.length === 0 ? (
          <div className={styles.empty}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.emptyIcon}>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-1a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v1" />
              <line x1="4" y1="4" x2="20" y2="20" strokeLinecap="round" />
            </svg>
            <p>No users found</p>
          </div>
        ) : (
          <div className={styles.list}>
            {searchResults.map((user) => (
              <div key={user.id} className={styles.resultItem}>
                <Avatar
                  size="medium"
                  src={user.profile_pic_url}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};