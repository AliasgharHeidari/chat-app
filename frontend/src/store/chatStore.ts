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
  setCurrentChat: (chat: Chat | null) => void;
  loadChats: () => Promise<void>;
  initChat: (targetUsername: string) => Promise<Chat>;
  loadChatMessages: (chatId: number, limit?: number, offset?: number) => Promise<any>; // 🔥 تغییر تایپ
  addMessage: (chatId: number, message: Message) => void;
  updateMessage: (chatId: number, messageId: number, updates: Partial<Message>) => void;
  removeMessage: (chatId: number, messageId: number) => void;
  clearMessages: (chatId: number) => void;
  updateChatLastMessage: (chatId: number, message: Message) => void;
  searchUsers: (query: string) => Promise<void>;
  clearSearchResults: () => void;
  setUserOnline: (userId: number) => void;
  setUserOffline: (userId: number) => void;
  setOnlineUsers: (userIds: number[]) => void;
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

  setCurrentChat: (chat) => {
    set({ currentChat: chat });
    if (chat) {
      localStorage.setItem("current_chat_id", String(chat.id));
    } else {
      localStorage.removeItem("current_chat_id");
    }
  },

  loadChats: async () => {
    set({ isLoadingChats: true, error: null });
    try {
      const chats = await api.getAllChats();
      set({ chats, isLoadingChats: false });
    } catch (error) {
      set({ error: api.getErrorMessage(error), isLoadingChats: false });
    }
  },

  initChat: async (targetUsername) => {
    set({ error: null });
    try {
      const chat = await api.initChat({ target_username: targetUsername });
      set((state) => ({
        chats: state.chats.some((c) => c.id === chat.id) ? state.chats : [...state.chats, chat],
        currentChat: chat,
      }));
      localStorage.setItem("current_chat_id", String(chat.id));
      return chat;
    } catch (error) {
      set({ error: api.getErrorMessage(error) });
      throw error;
    }
  },

  // 🔥 اصلاح شده با return
  loadChatMessages: async (chatId, limit = 20, offset = 0) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const response = await api.getChatMessages(chatId, limit, offset);
      
      const sortedMessages = [...response.messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      set((state) => {
        const existingMessages = state.messages[chatId] || [];
        
        if (offset === 0) {
          return {
            messages: {
              ...state.messages,
              [chatId]: sortedMessages,
            },
            isLoadingMessages: false,
          };
        }
        
        const allMessages = [...sortedMessages, ...existingMessages];
        const uniqueMessages = Array.from(
          new Map(allMessages.map((msg) => [msg.id, msg])).values()
        );
        
        return {
          messages: {
            ...state.messages,
            [chatId]: uniqueMessages,
          },
          isLoadingMessages: false,
        };
      });
      
      return response; // 🔥 برگردون
    } catch (error) {
      set({ error: api.getErrorMessage(error), isLoadingMessages: false });
      return null; // 🔥 برگردون
    }
  },

  addMessage: (chatId, message) => {
    const currentMessages = get().messages[chatId] || [];
    if (currentMessages.some((m) => m.id === message.id)) return;
    set({
      messages: {
        ...get().messages,
        [chatId]: [...currentMessages, message],
      },
    });
  },

  updateMessage: (chatId, messageId, updates) => {
    const messages = get().messages[chatId] || [];
    set({
      messages: {
        ...get().messages,
        [chatId]: messages.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
      },
    });
  },

  removeMessage: (chatId, messageId) => {
    const messages = get().messages[chatId] || [];
    set({
      messages: {
        ...get().messages,
        [chatId]: messages.filter((m) => m.id !== messageId),
      },
    });
  },

  clearMessages: (chatId) => {
    const { [chatId]: _, ...rest } = get().messages;
    set({ messages: rest });
  },

  updateChatLastMessage: (chatId, message) => {
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, last_message: message, updated_at: message.created_at }
          : chat
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
    set((state) => ({
      onlineUsers: new Set(state.onlineUsers).add(userId),
    }));
  },

  setUserOffline: (userId) => {
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      newSet.delete(userId);
      return { onlineUsers: newSet };
    });
  },

  setOnlineUsers: (userIds) => {
    set({ onlineUsers: new Set(userIds) });
  },

  setUserTyping: (chatId, userId) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: new Set(state.typingUsers[chatId] || []).add(userId),
      },
    }));
  },

  setUserNotTyping: (chatId, userId) => {
    set((state) => {
      const set = new Set(state.typingUsers[chatId] || []);
      set.delete(userId);
      return {
        typingUsers: {
          ...state.typingUsers,
          [chatId]: set,
        },
      };
    });
  },

  setError: (error) => set({ error }),
}));