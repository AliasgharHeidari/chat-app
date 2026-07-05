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
    <h1 className={styles.appTitle}>💬 Chat</h1>
    <div className={styles.headerActions}>
      <button
        onClick={onSettingsClick}
        className={styles.settingsButton}
        title="Settings"
        aria-label="Open settings"
      >
        ⚙️
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
      <span className={styles.connectionStatus}>Connecting...</span>
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div className={styles.placeholder}>
    <p>Select a chat to start messaging</p>
  </div>
);

// ========================================
// 🏠 لایه‌بندی اصلی
// ========================================

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
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

  const { isConnected, sendMessage, sendTyping } = useSocket();

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
    [isMobile, setCurrentChat, navigate]
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

  // ========================================
  // ♻️ محاسبات memoized با نوع‌دهی درست
  // ========================================

  const showChat = useMemo(
    () => !isMobile && currentChat !== null && user !== null,
    [isMobile, currentChat, user]
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
      />
    </div>
  );
};