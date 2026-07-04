import React, { useState, useEffect } from "react";
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

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
  const [showSearchUsers, setShowSearchUsers] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleChatSelect = async (chat: any) => {
    setCurrentChat(chat);
    setShowSearchUsers(false);
    if (isMobile) {
      navigate(`/chat/${chat.id}`);
    }
  };

  if (isLoadingChats && chats.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner fullScreen size="large" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.appTitle}>💬 Chat</h1>
          <div className={styles.headerActions}>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={styles.settingsButton}
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>

        {showSearchUsers ? (
          <SearchUsers
            onChatCreated={() => setShowSearchUsers(false)}
            onClose={() => setShowSearchUsers(false)}
          />
        ) : (
          <UserList
            chats={chats}
            currentChat={currentChat}
            currentUserId={user?.id || 0}
            isLoading={isLoadingChats}
            onChatSelect={handleChatSelect}
            onNewChat={() => setShowSearchUsers(true)}
          />
        )}
      </div>

      <div className={styles.main}>
        {!isConnected && (
          <div className={styles.connectionNotice}>
            <span className={styles.connectionStatus}>Connecting...</span>
          </div>
        )}

        {!isMobile && currentChat && user ? (
          <ChatContainer
            chat={currentChat}
            currentUserId={user.id}
            typingUsers={typingUsers[currentChat.id] || new Set()}
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
          <div className={styles.placeholder}>
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};