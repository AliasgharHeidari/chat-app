import { create } from "zustand";
import type { Chat, Message, SearchUsersResponse } from "@/types";
import { api } from "@/api/rest";

const CURRENT_CHAT_STORAGE_KEY = "current_chat_id";

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
  // آپدیت آخرین پیام در لیست چت‌ها
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

  // ✅ حالا currentChat رو در localStorage هم نگه می‌داریم
  // تا بعد از رفرش صفحه بشه دوباره بازیابیش کرد.
  setCurrentChat: (chat) => {
    set({ currentChat: chat });
    if (chat) {
      localStorage.setItem(CURRENT_CHAT_STORAGE_KEY, String(chat.id));
    } else {
      localStorage.removeItem(CURRENT_CHAT_STORAGE_KEY);
    }
  },

  loadChats: async () => {
    set({ isLoadingChats: true, error: null });
    try {
      const chats = await api.getAllChats();
      set({ chats, isLoadingChats: false });

      // ✅ بعد از لود شدن چت‌ها، اگه چت جاری هنوز ست نشده
      // (مثلاً بعد از رفرش صفحه)، از localStorage بازیابی کن.
      const state = get();
      if (!state.currentChat) {
        const savedChatId = localStorage.getItem(CURRENT_CHAT_STORAGE_KEY);
        if (savedChatId) {
          const restoredChat = chats.find(
            (c) => c.id === Number(savedChatId),
          );
          if (restoredChat) {
            set({ currentChat: restoredChat });
          } else {
            // چت دیگه معتبر نیست (مثلاً حذف شده)، پاکش کن
            localStorage.removeItem(CURRENT_CHAT_STORAGE_KEY);
          }
        }
      }
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
      get().setCurrentChat(chat);
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

    if (offset === 0) {
      // ✅ جدیدترین‌ها اول هستن، پس معکوسشون کن تا قدیمی‌ترین اول بشه
      const reversedMessages = [...response.messages].reverse();
      set({
        messages: {
          ...state.messages,
          [chatId]: reversedMessages,
        },
        isLoadingMessages: false,
      });
    } else {
      // Pagination - append new messages and deduplicate
      const allMessages = [...existingMessages, ...response.messages];
      const deduped = Array.from(
        new Map(allMessages.map((msg) => [msg.id, msg])).values(),
      );
      set({
        messages: {
          ...state.messages,
          [chatId]: deduped,
        },
        isLoadingMessages: false,
      });
    }
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
    // Avoid duplicates
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
    const state = get();
    const chatMessages = state.messages[chatId] || [];
    const filtered = chatMessages.filter((msg) => msg.id !== messageId);
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