import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useSocket } from "@/hooks/useSocket";
import { UserList } from "@/components/chat/UserList";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { SearchUsers } from "@/components/chat/SearchUsers";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SettingsPanel } from "@/components/profile/SettingsPanel";
import { useNavigate } from "react-router-dom";
import styles from "./MainLayout.module.css";

// ========================================
// 🧩 کامپوننت‌های داخلی
// ========================================
const Header: React.FC<{ onSettingsClick: () => void }> = ({
  onSettingsClick,
}) => (
  <div className={styles.sidebarHeader}>
    <div className={styles.brand}>
      <h1 className={styles.appTitle}>Atrin</h1>
    </div>
    <div className={styles.headerActions}>
      <button
        onClick={onSettingsClick}
        className={styles.settingsButton}
        title="Settings"
        aria-label="Open settings"
      >
        <svg
          viewBox="0 0 32 32"
          width="18"
          height="18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <circle
              cx="16"
              cy="16"
              fill="none"
              r="15"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeMiterlimit={10}
              strokeWidth={2}
            />
            <path
              d="M26,27L26,27 c0-5.523-4.477-10-10-10h0c-5.523,0-10,4.477-10,10v0"
              fill="none"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeMiterlimit={10}
              strokeWidth={2}
            />
            <circle
              cx="16"
              cy="11"
              fill="none"
              r="6"
              stroke="currentColor"
              strokeLinejoin="round"
              strokeMiterlimit={10}
              strokeWidth={2}
            />
          </g>
        </svg>
      </button>
    </div>
  </div>
);

const ConnectionStatus: React.FC<{ isConnected: boolean }> = ({
  isConnected,
}) => {
  if (isConnected) return null;
  return (
    <div className={styles.connectionNotice}>
      <span className={styles.connectionDot} aria-hidden="true" />
      <span className={styles.connectionStatus}>Connecting...</span>
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div className={styles.placeholder}>
    <div className={styles.placeholderInner}>
      <svg
        className={styles.placeholderIcon}
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 5.5C4 4.67 4.67 4 5.5 4h13c.83 0 1.5.67 1.5 1.5v10c0 .83-.67 1.5-1.5 1.5H9l-4 4v-4H5.5C4.67 16 4 15.33 4 14.5v-9Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M8 9h8M8 12.5h5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <p className={styles.placeholderTitle}>Select a chat</p>
      <p className={styles.placeholderSubtitle}>
        Choose a conversation from the list to start messaging
      </p>
    </div>
  </div>
);

// ========================================
// 🏠 لایه‌بندی اصلی
// ========================================
export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [showSearchUsers, setShowSearchUsers] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    chats,
    currentChat,
    isLoadingChats,
    setCurrentChat,
    loadChats,
    updateMessage,
    typingUsers,
  } = useChat();
  const { isConnected, sendMessage, sendTyping, disconnect } = useSocket();

  // ========================================
  // 🎯 هندلرهای رویداد
  // ========================================
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const handleChatSelect = useCallback(
    (chat: any) => {
      setCurrentChat(chat);
      setShowSearchUsers(false);
      if (isMobile) {
        navigate(`/chat/${chat.id}`);
      }
    },
    [isMobile, setCurrentChat, navigate],
  );

  const handleSettingsToggle = useCallback(() => {
    setIsSettingsOpen((prev) => !prev);
  }, []);

  const handleNewChat = useCallback(() => {
    setShowSearchUsers(true);
  }, []);

  const handleSearchClose = useCallback(() => {
    setShowSearchUsers(false);
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(() => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    disconnect();
    logout();
  }, [disconnect, logout, navigate, isLoggingOut]);

  // ========================================
  // ♻️ محاسبات memoized
  // ========================================
  const showChat = useMemo(
    () => !isMobile && currentChat !== null && user !== null,
    [isMobile, currentChat, user],
  );

  const typingSet = useMemo((): Set<number> => {
    if (!currentChat) return new Set<number>();
    const set = typingUsers[currentChat.id];
    return set instanceof Set ? set : new Set<number>();
  }, [typingUsers, currentChat]);

  // ========================================
  // 🔄 اثرات جانبی
  // ========================================
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // ========================================
  // 🚦 وضعیت بارگذاری
  // ========================================
  if (isLoadingChats && chats.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner fullScreen size="large" />
      </div>
    );
  }

  // ========================================
  // 🎨 رندر اصلی
  // ========================================
  return (
    <div className={styles.container}>
      {/* 📌 سایدبار */}
      <aside className={styles.sidebar}>
        <Header onSettingsClick={handleSettingsToggle} />
        <div className={styles.sidebarBody}>
          {showSearchUsers ? (
            <SearchUsers
              onChatCreated={handleSearchClose}
              onClose={handleSearchClose}
            />
          ) : (
            <UserList
              chats={chats}
              currentChat={currentChat}
              currentUserId={user?.id || 0}
              isLoading={isLoadingChats}
              onChatSelect={handleChatSelect}
              onNewChat={handleNewChat}
            />
          )}
        </div>
      </aside>

      {/* 📋 بخش اصلی */}
      <main className={styles.main}>
        <ConnectionStatus isConnected={isConnected} />
        {showChat && currentChat && user ? (
          <ChatContainer
            chat={currentChat}
            currentUserId={user.id}
            typingUsers={typingSet}
            onSendMessage={(text) => sendMessage(currentChat.id, text)}
            onTyping={(isTyping) => sendTyping(currentChat.id, isTyping)}
            onEditMessage={(messageId, newText) =>
              updateMessage(currentChat.id, messageId, {
                message_text: newText,
                is_edited: true,
              })
            }
          />
        ) : (
          <EmptyState />
        )}
      </main>

      {/* ⚙️ پنل تنظیمات */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onLogout={handleLogout}
      />
    </div>
  );
};
