import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useSocket } from "@/hooks/useSocket";
import { UserList } from "@/components/chat/UserList";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { SearchUsers } from "@/components/chat/SearchUsers";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import styles from "./MainLayout.module.css";

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    chats,
    currentChat,
    currentMessages,
    isLoadingChats,
    setCurrentChat,
    loadChats,
    loadChatMessages,
    updateMessage,
    removeMessage,
    typingUsers,
  } = useChat();
  const { isConnected, sendMessage, sendTyping } = useSocket();
  const [showSearchUsers, setShowSearchUsers] = useState(false);

  React.useEffect(() => {
    loadChats();
  }, [loadChats]);

  React.useEffect(() => {
    if (currentChat) {
      loadChatMessages(currentChat.id);
    }
  }, [currentChat, loadChatMessages]);

  const handleChatSelect = async (chat: any) => {
    setCurrentChat(chat);
    setShowSearchUsers(false);
  };

  const handleSendMessage = (text: string) => {
    if (currentChat) {
      sendMessage(currentChat.id, text);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (currentChat) {
      sendTyping(currentChat.id, isTyping);
    }
  };

  const handleEditMessage = (messageId: number, newText: string) => {
    if (currentChat) {
      updateMessage(currentChat.id, messageId, {
        message_text: newText,
        is_edited: true,
      });
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    if (currentChat) {
      // default: delete for me
      removeMessage(currentChat.id, messageId);
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
          <h1 className={styles.appTitle}>Chat</h1>
          <div className={styles.headerActions}>
            {user && <span className={styles.username}>{user.username}</span>}
            <button
              onClick={logout}
              className={styles.logoutButton}
              title="Logout"
            >
              ↓
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

        {currentChat && user ? (
          <ChatContainer
            chat={currentChat}
            messages={currentMessages}
            currentUserId={user.id}
            typingUsers={typingUsers[currentChat.id] || new Set()}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
          />
        ) : (
          <div className={styles.placeholder}>
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};
