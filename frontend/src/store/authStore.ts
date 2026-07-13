import { create } from "zustand";
import type { User } from "@/types";
import { api } from "@/api/rest";

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setError: (error: string | null) => void;
  register: (
    username: string,
    firstName: string,
    lastName: string,
    email: string, // 🔥 جدید
    password: string,
  ) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>; // 🔥 جدید
  verifyEmail: (email: string, code: string) => Promise<void>; // 🔥 جدید
  resendVerification: (email: string) => Promise<void>; // 🔥 جدید
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const initialToken = localStorage.getItem("auth_token");
if (initialToken) {
  api.setToken(initialToken);
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: initialToken,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    api.setToken(token);
    set({ token });
  },
  setError: (error) => set({ error }),

  // 🔥 ثبت‌نام با ایمیل
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
      const result = await api.login({ username, password });
      set({
        user: result.user,
        token: result.token,
        isLoading: false,
      });
      api.setToken(result.token);
    } catch (error) {
      set({
        error: api.getErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  // 🔥 جدید - لاگین با گوگل
  loginWithGoogle: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.loginWithGoogle(idToken);
      set({
        user: result.user,
        token: result.token,
        isLoading: false,
      });
      api.setToken(result.token);
    } catch (error) {
      set({
        error: api.getErrorMessage(error),
        isLoading: false,
      });
      throw error;
    }
  },

  // 🔥 جدید - تایید ایمیل
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

  // 🔥 جدید - ارسال مجدد کد تایید
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

  logout: () => {
    set({
      user: null,
      token: null,
      error: null,
    });
    api.setToken(null);
  },

  getCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const user = await api.getProfile();
      set({ user, isLoading: false });
    } catch (error) {
      set({
        error: api.getErrorMessage(error),
        isLoading: false,
      });
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