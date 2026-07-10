import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useSocket } from "@/hooks/useSocket";
import { ChatContainer } from "./ChatContainer";
import { UserProfileModal } from "./UserProfileModal";
import { Avatar } from "@/components/common/Avatar";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import styles from "./ChatRoom.module.css";

export const ChatRoom: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentChat,
    setCurrentChat,
    loadChatMessages,
    typingUsers,
    loadChats,
    chats,
    updateMessage,
  } = useChat();
  const { sendMessage, sendTyping } = useSocket();
  const [loading, setLoading] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { isUserOnline } = useChat();

  useEffect(() => {
    const loadChat = async () => {
      if (chats.length === 0) {
        await loadChats();
      }

      const chat = chats.find((c) => c.id === Number(chatId));
      if (chat) {
        setCurrentChat(chat);
        await loadChatMessages(chat.id, 20, 0);
      } else if (chatId) {
        navigate("/");
      }
      setLoading(false);
    };

    loadChat();
  }, [chatId, chats, loadChats, setCurrentChat, loadChatMessages, navigate]);

  const handleBack = () => {
    navigate("/");
  };

  const handleUserClick = () => {
    setIsProfileModalOpen(true);
  };

  if (loading || !currentChat || !user) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const otherUser = currentChat.user1_id === user.id ? currentChat.user2 : currentChat.user1;
  const otherName = otherUser
    ? `${otherUser.first_name} ${otherUser.last_name}`
    : "Unknown";
  const otherInitials = otherUser
    ? `${otherUser.first_name[0]}${otherUser.last_name[0]}`.toUpperCase()
    : "U";
  const isOnline = otherUser ? isUserOnline(otherUser.id) : false;

  // ✅ FIX: this header used to hardcode "Online" / "Offline" only,
  // completely ignoring last_seen. Now it mirrors the same fallback
  // logic UserStatus.tsx already uses.
  const statusText = isOnline
    ? "Online"
    : otherUser?.last_seen
      ? `Last seen ${otherUser.last_seen}`
      : "Offline";

  const userForModal = otherUser
    ? { ...otherUser, is_online: isOnline }
    : null;

  return (
    <div className={styles.container}>
      {/* ✅ هدر کامل موبایل با کلیک‌پذیری */}
      <div className={styles.header}>
        <button
          onClick={handleBack}
          className={styles.backBtn}
          aria-label="Back to chats"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className={styles.userInfo} onClick={handleUserClick}>
          <Avatar
            src={otherUser?.profile_pic_url}
            initials={otherInitials}
            size="medium"
            isOnline={isOnline}
          />
          <div className={styles.userText}>
            <span className={styles.userName}>{otherName}</span>
            <span
              className={`${styles.userStatus} ${isOnline ? styles.online : styles.offline}`}
            >
              {isOnline && <span className={styles.statusDot} aria-hidden="true" />}
              {statusText}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.chatWrapper}>
        <ChatContainer
          chat={currentChat}
          currentUserId={user.id}
          typingUsers={typingUsers[currentChat.id] || new Set()}
          onSendMessage={(text) => sendMessage(Number(chatId), text)}
          onTyping={(isTyping) => sendTyping(Number(chatId), isTyping)}
          onEditMessage={(messageId, newText) =>
            updateMessage(Number(currentChat.id), messageId, {
              message_text: newText,
              is_edited: true,
            })
          }
          hideUserStatus={true}
        />
      </div>

      <UserProfileModal
        user={userForModal}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};