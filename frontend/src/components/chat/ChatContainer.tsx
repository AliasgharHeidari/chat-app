import React, { useState, useEffect } from "react";
import type { Chat } from "@/types";
import { MessageList } from "./MessageList";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/store/chatStore";
import { useSettingsStore } from "@/store/SettingsStore";
import { useSocket } from "@/hooks/useSocket";
import { MessageInput } from "./MessageInput";
import { UserStatus } from "./UserStatus";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { UserProfileModal } from "./UserProfileModal";
import { api } from "@/api/rest";
import styles from "./ChatContainer.module.css";

interface ChatContainerProps {
  chat: Chat;
  currentUserId: number;
  typingUsers: Set<number>;
  onSendMessage: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
  onEditMessage?: (messageId: number, newText: string) => void;
  hideUserStatus?: boolean;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  chat,
  currentUserId,
  typingUsers,
  onSendMessage,
  onTyping,
  onEditMessage,
  hideUserStatus = false,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [offset, setOffset] = useState(20);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // ✅ State برای انتخاب پیام‌ها
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());

  const messages = useChatStore((state) => state.messages[chat.id] || []);
  const isLoadingMessages = useChatStore((state) => state.isLoadingMessages);
  const loadChatMessages = useChatStore((state) => state.loadChatMessages);

  // 🔥 بک‌گراند چت - از استور تنظیمات خونده می‌شه (موبایل و دسکتاپ مشترک)
  const chatBackground = useSettingsStore((state) => state.chatBackground);
  const backgroundImage = chatBackground || "/background-images/default-image-1.jpg";

  const { markAsSeen } = useSocket();
  const { isUserOnline } = useChat();

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

  // 🔥 آیا طرف مقابل داره تایپ می‌کنه؟ (خودمون رو از ست حذف می‌کنیم)
  const isOtherUserTyping = Array.from(typingUsers).some(
    (userId) => userId !== currentUserId,
  );

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
      // بعد از حذف، اگه پیام انتخاب شده بود، از لیست انتخاب حذفش کن
      setSelectedMessages(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  // ✅ مدیریت انتخاب/لغو انتخاب پیام
  // قبلاً اینجا هیچ‌وقت setIsSelectMode(true) صدا زده نمی‌شد، برای همین بعد از
  // انتخاب پیام‌ها toolbar و چک‌باکس‌ها هیچ‌وقت نمایش داده نمی‌شدن.
  const handleToggleSelect = (messageId: number) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      // به‌محض اینکه حداقل یه پیام انتخاب بشه، وارد حالت انتخاب می‌شیم
      setIsSelectMode(newSet.size > 0);
      return newSet;
    });
  };



  // ✅ لغو همه انتخاب‌ها
  const clearSelection = () => {
    setSelectedMessages(new Set());
    setIsSelectMode(false);
  };


  // ✅ کپی کردن پیام‌های انتخاب شده
  // navigator.clipboard فقط تو Secure Context (https یا localhost) کار می‌کنه؛
  // اگه در دسترس نبود، با document.execCommand('copy') به‌عنوان fallback کپی می‌کنیم.
  const copySelectedMessages = async () => {
    const selectedMsgs = messages.filter(msg => selectedMessages.has(msg.id));
    const text = selectedMsgs.map(msg => msg.message_text).join('\n');

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!successful) {
          throw new Error('execCommand copy failed');
        }
      }
      alert(`${selectedMsgs.length} message(s) copied!`);
      clearSelection();
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Copy failed. Your browser may be blocking clipboard access on this connection.');
    }
  };

  // ✅ حذف پیام‌های انتخاب شده
  // فعلاً کاربر فقط می‌تونه پیام‌های خودش رو حذف کنه (بدون گزینه‌ی
  // جداگانه‌ی "برای من"/"برای همه") - این دکمه فقط وقتی نمایش داده
  // می‌شه که همه‌ی پیام‌های انتخاب‌شده متعلق به خودش باشن.
  const deleteSelectedMessages = async () => {
    if (!confirm(`Delete ${selectedMessages.size} message(s)?`)) return;
    const ids = Array.from(selectedMessages);
    for (const id of ids) {
      await handleDeleteMessage(id, true);
    }
    clearSelection();
  };

  const handleUserClick = () => {
    if (otherUser) {
      setIsProfileModalOpen(true);
    }
  };

  if (!otherUser) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  const otherIsOnline = isUserOnline(otherUser.id);
  const hasMore = messages.length >= offset && messages.length > 0;

  // ✅ Delete فقط وقتی نمایش داده می‌شه که همه‌ی پیام‌های انتخاب‌شده
  // متعلق به خود کاربر باشن. اگه حتی یکی از پیام‌های طرف مقابل هم
  // انتخاب شده باشه، فقط Copy می‌مونه.
  const selectedMessagesList = messages.filter((m) => selectedMessages.has(m.id));
  const canDeleteSelected =
    selectedMessagesList.length > 0 &&
    selectedMessagesList.every((m) => m.sender_id === currentUserId);

  const userForModal = {
    ...otherUser,
    is_online: otherIsOnline,
  };

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {!hideUserStatus && (
        <UserStatus
          userId={otherUser.id}
          name={otherUserName}
          lastSeen={otherUser.last_seen}
          initials={otherUserInitials}
          profilePicUrl={otherUser.profile_pic_url}
          isTyping={isOtherUserTyping}
          onClick={handleUserClick}
        />
      )}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isLoading={isLoadingMessages}
        isSelectMode={isSelectMode}
        selectedMessages={selectedMessages}
        onToggleSelect={handleToggleSelect}
        onEdit={handleEditMessage}
        onDelete={handleDeleteMessage}
        onSeen={markAsSeen}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
      {/* ✅ نوار ابزار انتخاب */}
      {isSelectMode && selectedMessages.size > 0 && (
        <div className={styles.selectionToolbar}>
          <div className={styles.selectionInfo}>
            <span className={styles.selectionCount}>{selectedMessages.size}</span>
            <span className={styles.selectionLabel}>selected</span>
          </div>
          <div className={styles.selectionActions}>
            <button onClick={copySelectedMessages} className={styles.actionBtn} title="Copy">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            {canDeleteSelected && (
              <button onClick={deleteSelectedMessages} className={`${styles.actionBtn} ${styles.danger}`} title="Delete">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="12" y1="11" x2="12" y2="17" />
                  <line x1="9" y1="14" x2="15" y2="14" />
                </svg>
              </button>
            )}
            <button onClick={clearSelection} className={styles.actionBtn} title="Clear">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={onTyping}
        isLoading={isSending}
      />
      <UserProfileModal
        user={userForModal}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};