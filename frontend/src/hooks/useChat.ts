import { useChatStore } from "@/store/chatStore";

export function useChat() {
  const {
    chats,
    messages,
    currentChat,
    searchResults,
    onlineUsers,
    typingUsers,
    isLoadingChats,
    isLoadingMessages,
    error,
    setCurrentChat,
    loadChats,
    initChat,
    loadChatMessages,
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    searchUsers,
    clearSearchResults,
    setUserOnline,
    setUserOffline,
    setUserTyping,
    setUserNotTyping,
  } = useChatStore();

  const currentChatId = currentChat?.id;
  const currentMessages = currentChatId ? messages[currentChatId] || [] : [];

  const getOtherUser = () => {
    if (!currentChat) return null;
    // Determine which user is the other person (not current auth user)
    // This is typically handled at the component level with current user context
    return currentChat.user2 || currentChat.user1;
  };

  const isUserOnline = (userId: number) => onlineUsers.has(userId);

  const isUserTyping = (userId: number) => {
    if (!currentChatId) return false;
    return typingUsers[currentChatId]?.has(userId) || false;
  };

  return {
    chats,
    messages,
    currentChat,
    currentMessages,
    searchResults,
    onlineUsers,
    typingUsers,
    isLoadingChats,
    isLoadingMessages,
    error,
    setCurrentChat,
    loadChats,
    initChat,
    loadChatMessages,
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    searchUsers,
    clearSearchResults,
    setUserOnline,
    setUserOffline,
    setUserTyping,
    setUserNotTyping,
    getOtherUser,
    isUserOnline,
    isUserTyping,
  };
}
