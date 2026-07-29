// frontend/src/store/authStore.ts
import { create } from "zustand";
import type { User } from "@/types";
import { api } from "@/api/rest";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  register: (
    username: string,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),

  register: async (username, firstName, lastName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      await api.register({
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });
      set({ isLoading: false });
    } catch (error) {
      set({
        error: api.getErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await api.login({ username, password });
      set({ user, isLoading: false });
    } catch (error) {
      set({
        error: api.getErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  loginWithGoogle: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await api.loginWithGoogle(idToken);
      set({ user, isLoading: false });
    } catch (error) {
      set({
        error: api.getErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  verifyEmail: async (email, code) => {
    set({ isLoading: true, error: null });
    try {
      await api.verifyEmail({ email, code });
      set({ isLoading: false });
    } catch (error) {
      set({
        error: api.getErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  resendVerification: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await api.resendVerification({ email });
      set({ isLoading: false });
    } catch (error) {
      set({
        error: api.getErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

// frontend/src/store/authStore.ts

logout: async () => {
    set({ isLoading: true });
    try {
        await api.logout();
        set({ 
            user: null, 
            isLoading: false,
            error: null 
        });
    } catch (error) {
        // 🔥 حتی اگه خطا باشه، کاربر رو پاک کن
        set({ 
            user: null, 
            isLoading: false,
            error: api.getErrorMessage(error) 
        });
    }
},

getCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const user = await api.getProfile();
      set({ user, isLoading: false });
    } catch (error) {
      // 🔥 این یه چک پس‌زمینه‌ست (silent session check)، نه اقدام مستقیم کاربر
      // نباید error رو ست کنیم، چون باعث نمایش پیام گمراه‌کننده میشه
      set({ user: null, isLoading: false });
    }
},

  updateProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.updateProfile(updates);
      set({ user, isLoading: false });
    } catch (error) {
      set({
        error: api.getErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },
}));