import axios, { AxiosInstance } from "axios";
import type {
  User,
  RegisterRequest,
  LoginRequest,
  UpdateProfileRequest,
  Chat,
  InitChatRequest,
  Message,
  SendMessageRequest,
  EditMessageRequest,
  DeleteMessageRequest,
  AuthResponse,
  SearchUsersResponse,
  GetMessagesResponse,
  VerifyEmailRequest,
  ResendVerificationRequest,
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class ChatAPI {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      this.token = storedToken;
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  getToken() {
    return this.token;
  }

  // 🔥 Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post("/auth/register", data);
    // بعد از ثبت‌نام، توکنی برنمی‌گرده (فقط پیام موفقیت)
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post("/auth/login", data);
    const token = response.data.token;
    if (!token) {
      throw new Error("Login response did not include token");
    }
    this.setToken(token);
    if (response.data.user) {
      return { token, user: response.data.user };
    }
    const profileResponse = await this.client.get("/chat/me");
    const profileData = profileResponse.data.user ?? profileResponse.data;
    return { token, user: profileData };
  }

  // 🔥 جدید - لاگین با گوگل
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await this.client.post("/auth/google", {
      id_token: idToken,
    });
    const { token, user } = response.data;
    if (token) {
      this.setToken(token);
    }
    return { token, user };
  }

  // 🔥 جدید - تایید ایمیل
  async verifyEmail(data: VerifyEmailRequest): Promise<{ message: string }> {
    const response = await this.client.post("/auth/verify-email", data);
    return response.data;
  }

  // 🔥 جدید - ارسال مجدد کد تایید
  async resendVerification(data: ResendVerificationRequest): Promise<{ message: string }> {
    const response = await this.client.post("/auth/resend-verification", data);
    return response.data;
  }

  // Profile endpoints
  async getProfile(): Promise<User> {
    const response = await this.client.get("/chat/me");
    return response.data.user ?? response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await this.client.put("/chat/me", data);
    if (response.data && response.data.user) {
      return response.data.user;
    }
    return this.getProfile();
  }

  // Chat endpoints
  async initChat(data: InitChatRequest): Promise<Chat> {
    const response = await this.client.post("/chat/chats/init", data);
    return response.data;
  }

  async getAllChats(): Promise<Chat[]> {
    const response = await this.client.get("/chat/chats");
    return response.data.chats ?? response.data;
  }

  async getChatById(chatId: number): Promise<Chat> {
    const response = await this.client.get(`/chat/chats/${chatId}`);
    return response.data.chat ?? response.data;
  }

  async getChatMessages(
    chatId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<GetMessagesResponse> {
    const response = await this.client.get(
      `/chat/chats/${chatId}/messages?limit=${limit}&offset=${offset}`,
    );
    return response.data;
  }

  // Message endpoints
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    const response = await this.client.post("/chat/messages", data);
    return response.data;
  }

  async editMessage(
    messageId: number,
    data: EditMessageRequest,
  ): Promise<Message> {
    const response = await this.client.put(`/chat/messages/${messageId}`, data);
    return response.data;
  }

  async deleteMessage(
    messageId: number,
    data: DeleteMessageRequest,
  ): Promise<void> {
    await this.client({
      method: 'delete',
      url: `/chat/messages/${messageId}`,
      data: data,
    });
  }

  // User endpoints
  async searchUsers(query: string): Promise<SearchUsersResponse[]> {
    const response = await this.client.get(`/chat/users/search?q=${query}`);
    return response.data.users ?? [];
  }

  async getUserByUsername(username: string): Promise<User> {
    const response = await this.client.get(`/chat/users/${username}`);
    return response.data.user ?? response.data;
  }

  getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.error || error.response?.data?.message || error.message;
    }
    return String(error);
  }
}

export const api = new ChatAPI();