// User Types
export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  bio?: string;
  profile_pic_url?: string;
  is_online: boolean;
  last_seen?: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  bio?: string;
  profile_pic_url?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UpdateProfileRequest {
  username?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  profile_pic_url?: string;
}

// Chat Types
export interface Chat {
  id: number;
  user1_id: number;
  user2_id: number;
  user1?: User;
  user2?: User;
  created_at: string;
  updated_at: string;
}

export interface InitChatRequest {
  target_username: string;
}

// Message Types
export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "seen"
  | "failed";

export interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  sender_name?: string;
  message_text: string;
  status: MessageStatus;
  is_edited: boolean;
  edited_at?: string;
  is_deleted: boolean;
  deleted_for?: number;
  seen_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SendMessageRequest {
  chat_id: number;
  message_text: string;
}

export interface EditMessageRequest {
  new_text: string;
}

export interface DeleteMessageRequest {
  delete_for_everyone: boolean;
}

// WebSocket Types
export interface WSMessage<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
}

export interface WSNewMessage {
  message_id: number;
  chat_id: number;
  sender_id: number;
  sender_name: string;
  message_text: string;
  status: MessageStatus;
  created_at: string;
}

export interface WSNewMessageRequest {
  chat_id: number;
  message: string;
}

export interface WSMessageStatus {
  message_id: number;
  status: MessageStatus;
  seen_at?: string;
}

export interface WSMessageStatusRequest {
  message_id: number;
  status: MessageStatus;
  seen_at?: string;
}

export interface WSTyping {
  chat_id: number;
  user_id: number;
  is_typing: boolean;
}

export interface WSTypingRequest {
  chat_id: number;
  user_id: number;
  is_typing: boolean;
}

export interface WSTyping {
  chat_id: number;
  user_id: number;
  is_typing: boolean;
}

export interface WSUserStatus {
  user_id: number;
  is_online: boolean;
  last_seen?: string;
}

export interface WSMessageDeleted {
  message_id: number;
  chat_id: number;
}

export interface WSMessageEdited {
  message_id: number;
  new_text: string;
  edited_at: string;
}

// API Response Types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface SearchUsersResponse {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  bio?: string;
  profile_pic_url?: string;
  is_online: boolean;
}

export interface GetMessagesResponse {
  messages: Message[];
  count: number;
  limit: number;
  offset: number;
}
