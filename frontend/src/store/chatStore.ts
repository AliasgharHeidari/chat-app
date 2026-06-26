import { create } from "zustand";
import type { Chat, Message, SearchUsersResponse } from "@/types";
import { api } from "@/api/rest";

interface ChatStore {
  chats: Chat[];
  messages: Record<number, Message[]>;
  currentChat: Chat | null;
  searchResults: SearchUsersResponse[];
  onlineUsers: Set<number>;
  typingUsers: Record<number, Set<number>>;
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  error: string | null;

  // Chat actions
  setCurrentChat: (chat: Chat | null) => void;
  loadChats: () => Promise<void>;
  initChat: (targetUsername: string) => Promise<Chat>;
  loadChatMessages: (
    chatId: number,
    limit?: number,
    offset?: number,
  ) => Promise<void>;

  // Message actions
  addMessage: (chatId: number, message: Message) => void;
  updateMessage: (
    chatId: number,
    messageId: number,
    updates: Partial<Message>,
  ) => void;
  removeMessage: (chatId: number, messageId: number) => void;
  clearMessages: (chatId: number) => void;

  // ✅ جدید: آپدیت آخرین پیام در لیست چت‌ها
  updateChatLastMessage: (chatId: number, message: Message) => void;

  // Search actions
  searchUsers: (query: string) => Promise<void>;
  clearSearchResults: () => void;

  // Online status
  setUserOnline: (userId: number) => void;
  setUserOffline: (userId: number) => void;
  setOnlineUsers: (userIds: number[]) => void;

  // Typing status
  setUserTyping: (chatId: number, userId: number) => void;
  setUserNotTyping: (chatId: number, userId: number) => void;

  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  messages: {},
  currentChat: null,
  searchResults: [],
  onlineUsers: new Set(),
  typingUsers: {},
  isLoadingChats: false,
  isLoadingMessages: false,
  error: null,

  setCurrentChat: (chat) => set({ currentChat: chat }),

  loadChats: async () => {
    set({ isLoadingChats: true, error: null });
    try {
      const chats = await api.getAllChats();
      set({ chats, isLoadingChats: false });
    } catch (error) {
      set({
        error: api.getErrorMessage(error),
        isLoadingChats: false,
      });
    }
  },

  initChat: async (targetUsername) => {
    set({ error: null });
    try {
      const chat = await api.initChat({ target_username: targetUsername });
      const state = get();
      const existingChat = state.chats.find((c) => c.id === chat.id);
      if (!existingChat) {
        set({ chats: [...state.chats, chat] });
      }
      set({ currentChat: chat });
      return chat;
    } catch (error) {
      set({ error: api.getErrorMessage(error) });
      throw error;
    }
  },

  loadChatMessages: async (chatId, limit = 20, offset = 0) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const response = await api.getChatMessages(chatId, limit, offset);
      const state = get();
      const existingMessages = state.messages[chatId] || [];

      set({
        messages: {
          ...state.messages,
          [chatId]: [...existingMessages, ...response.messages], // ← اضافه کردن
        },
        isLoadingMessages: false,
      });
    } catch (error) {
      set({
        error: api.getErrorMessage(error),
        isLoadingMessages: false,
      });
    }
  },

  addMessage: (chatId, message) => {
    const state = get();
    const chatMessages = state.messages[chatId] || [];

    if (chatMessages.some((m) => m.id === message.id)) {
      return;
    }
    set({
      messages: {
        ...state.messages,
        [chatId]: [...chatMessages, message],
      },
    });
  },

  updateMessage: (chatId, messageId, updates) => {
    const state = get();
    const chatMessages = state.messages[chatId] || [];
    set({
      messages: {
        ...state.messages,
        [chatId]: chatMessages.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg,
        ),
      },
    });
  },

 removeMessage: (chatId, messageId) => {
  console.log("🗑️ REMOVE MESSAGE CALLED:", { chatId, messageId }); // ← این
  const state = get();
  const chatMessages = state.messages[chatId] || [];
  console.log("🗑️ BEFORE:", chatMessages.map(m => m.id)); // ← این
  const filtered = chatMessages.filter((msg) => msg.id !== messageId);
  console.log("🗑️ AFTER:", filtered.map(m => m.id)); // ← این
  set({
    messages: {
      ...state.messages,
      [chatId]: filtered,
    },
  });
},

  clearMessages: (chatId) => {
    const state = get();
    const messages = { ...state.messages };
    delete messages[chatId];
    set({ messages });
  },

  // ✅ جدید: آپدیت آخرین پیام در لیست چت‌ها
  updateChatLastMessage: (chatId, message) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              last_message: message,
              updated_at: message.created_at,
            }
          : chat,
      ),
    }));
  },

  searchUsers: async (query) => {
    set({ error: null });
    try {
      if (!query.trim()) {
        set({ searchResults: [] });
        return;
      }
      const results = await api.searchUsers(query);
      set({ searchResults: results });
    } catch (error) {
      set({ error: api.getErrorMessage(error) });
    }
  },

  clearSearchResults: () => set({ searchResults: [] }),

  setUserOnline: (userId) => {
    const state = get();
    const newOnlineUsers = new Set(state.onlineUsers);
    newOnlineUsers.add(userId);
    set({ onlineUsers: newOnlineUsers });
  },

  setUserOffline: (userId) => {
    const state = get();
    const newOnlineUsers = new Set(state.onlineUsers);
    newOnlineUsers.delete(userId);
    set({ onlineUsers: newOnlineUsers });
  },

  setOnlineUsers: (userIds) => {
    set({ onlineUsers: new Set(userIds) });
  },

  setUserTyping: (chatId, userId) => {
    const state = get();
    const typingSet = state.typingUsers[chatId] || new Set();
    typingSet.add(userId);
    set({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: new Set(typingSet),
      },
    });
  },

  setUserNotTyping: (chatId, userId) => {
    const state = get();
    const typingSet = state.typingUsers[chatId] || new Set();
    typingSet.delete(userId);
    set({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: new Set(typingSet),
      },
    });
  },

  setError: (error) => set({ error }),
}));
