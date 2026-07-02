import { useEffect, useState, useCallback } from "react";
import { wsManager } from "@/api/socket";
import { useAuthStore } from "@/store/authStore";
import { useChat } from "./useChat";
import { useChatStore } from "@/store/chatStore";
import type { Message } from "@/types";

export function useSocket() {
  const { token, user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const {
    addMessage,
    updateMessage,
    removeMessage,
    setUserOnline,
    setUserOffline,
    setUserTyping,
    setUserNotTyping,
    currentChat,
  } = useChat();

  const updateChatLastMessage = useChatStore(
    (state) => state.updateChatLastMessage,
  );

  useEffect(() => {
    if (!token) return;

    wsManager.setToken(token);
    setIsConnecting(true);

    wsManager
      .connect()
      .then(() => {
        setIsConnected(true);
        setIsConnecting(false);
      })
      .catch((error) => {
        console.error("Failed to connect WebSocket:", error);
        setIsConnecting(false);
      });

    const unsubConnect = wsManager.on("connect", () => {
      setIsConnected(true);
      setIsConnecting(false);
    });

    const unsubDisconnect = wsManager.on("disconnect", () => {
      setIsConnected(false);
    });

    const unsubNewMessage = wsManager.on("new_message", (data) => {
      console.debug("WS new_message:", data);

      const message: Message = {
        id: data.message_id,
        chat_id: data.chat_id,
        sender_id: data.sender_id,
        message_text: data.message_text,
        status: data.status || "sent",
        is_edited: false,
        is_deleted: false,
        created_at: data.created_at,
        updated_at: data.created_at,
      };

      addMessage(data.chat_id, message);
      updateChatLastMessage(data.chat_id, message);
    });

    const unsubMessageStatus = wsManager.on("message_status", (data) => {
      console.debug("WS message_status:", data);
      if (currentChat) {
        updateMessage(currentChat.id, data.message_id, {
          status: data.status,
        });
      }
    });

    const unsubTyping = wsManager.on("typing", (data) => {
      console.debug("WS typing:", data);
      if (currentChat?.id === data.chat_id) {
        if (data.is_typing) {
          setUserTyping(data.chat_id, data.user_id);
        } else {
          setUserNotTyping(data.chat_id, data.user_id);
        }
      }
    });

    const unsubUserStatus = wsManager.on("user_status", (data) => {
      console.debug("WS user_status:", data);
      if (data.is_online) {
        setUserOnline(data.user_id);
      } else {
        setUserOffline(data.user_id);
      }
    });

    const unsubMessageDeleted = wsManager.on("message_deleted", (data) => {
      console.log("🗑️ WS message_deleted RECEIVED:", data);
      console.log("🗑️ currentChat:", currentChat);
      if (currentChat?.id === data.chat_id) {
        console.log("🗑️ Removing message from WS:", data.message_id);
        removeMessage(data.chat_id, data.message_id);
      }
    });

    const unsubMessageEdited = wsManager.on("message_edited", (data) => {
      console.debug("WS message_edited:", data);
      if (currentChat) {
        updateMessage(currentChat.id, data.message_id, {
          message_text: data.new_text,
          is_edited: true,
        });
      }
    });

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubNewMessage();
      unsubMessageStatus();
      unsubTyping();
      unsubUserStatus();
      unsubMessageDeleted();
      unsubMessageEdited();
    };
  }, [
    token,
    currentChat,
    addMessage,
    updateMessage,
    removeMessage,
    setUserOnline,
    setUserOffline,
    setUserTyping,
    setUserNotTyping,
    updateChatLastMessage,
  ]);

  const sendMessage = useCallback((chatId: number, messageText: string) => {
    console.log("📤 sendMessage called in useSocket:", { chatId, messageText });
    wsManager.send("new_message", {
      chat_id: chatId,
      message: messageText,
    });
  }, []);

  const sendTyping = useCallback(
    (chatId: number, isTyping: boolean) => {
      wsManager.send("typing", {
        chat_id: chatId,
        user_id: user?.id || 0,
        is_typing: isTyping,
      });
    },
    [user],
  );

  const markAsSeen = useCallback((messageId: number) => {
    console.log("👁️ markAsSeen called for message:", messageId);
    wsManager.send("message_status", {
      message_id: messageId,
      status: "seen",
      seen_at: new Date().toISOString(),
    });
  }, []);

  const disconnect = useCallback(() => {
    wsManager.disconnect();
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    isConnecting,
    sendMessage,
    sendTyping,
    markAsSeen,
    disconnect,
  };
}
