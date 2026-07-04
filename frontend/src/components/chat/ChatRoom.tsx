import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useSocket } from "@/hooks/useSocket";
import { ChatContainer } from "./ChatContainer";
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

  if (loading || !currentChat || !user) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backBtn}>
          ←
        </button>
        <span className={styles.title}>
          {currentChat.user1?.id === user.id
            ? `${currentChat.user2?.first_name} ${currentChat.user2?.last_name}`
            : `${currentChat.user1?.first_name} ${currentChat.user1?.last_name}`}
        </span>
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
        />
      </div>
    </div>
  );
};