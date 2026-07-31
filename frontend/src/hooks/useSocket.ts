// frontend/src/hooks/useSocket.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { wsManager } from "@/api/socket";
import { useAuthStore } from "@/store/authStore";
import { useChat } from "./useChat";
import { useChatStore } from "@/store/chatStore";
import { useToast } from "./useToast"; // 🔥 جدید
import type { Message } from "@/types";

export function useSocket() {
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wasConnectedRef = useRef(false);
  const { show: showToast } = useToast(); // 🔥 جدید

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
  const updateChatLastMessage = useChatStore((state) => state.updateChatLastMessage);
  const loadChatMessages = useChatStore((state) => state.loadChatMessages);
  const loadChats = useChatStore((state) => state.loadChats);

  // ============================================
  // 🧠 مدیریت قطع اتصال توسط مرورگر
  // ============================================
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && user?.id) {
        setUserOffline(user.id);
      }
    };
    const handleBeforeUnload = () => {
      if (user?.id) {
        setUserOffline(user.id);
        wsManager.send("typing", {
          chat_id: currentChat?.id || 0,
          user_id: user.id,
          is_typing: false,
        });
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user?.id, setUserOffline, currentChat?.id]);

  // ============================================
  // 🔌 اتصال WebSocket
  // ============================================
  useEffect(() => {
    setIsConnecting(true);
    wsManager
      .connect()
      .then(() => {
        setIsConnected(true);
        wasConnectedRef.current = true;
        setIsConnecting(false);
        if (user?.id) {
          setUserOnline(user.id);
        }
      })
      .catch((error) => {
        console.error("Failed to connect WebSocket:", error);
        setIsConnecting(false);
      });

    const unsubConnect = wsManager.on("connect", () => {
      setIsConnected(true);
      wasConnectedRef.current = true;
      setIsConnecting(false);
      if (user?.id) {
        setUserOnline(user.id);
      }
    });

    const unsubDisconnect = wsManager.on("disconnect", () => {
      setIsConnected(false);
      if (user?.id) {
        setUserOffline(user.id);
      }
    });

    const unsubNewMessage = wsManager.on("new_message", (data) => {
      const message: Message = {
        id: data.message_id,
        chat_id: data.chat_id,
        sender_id: data.sender_id,
        sender_name: data.sender_name,
        message_text: data.message_text,
        status: data.status || "sent",
        is_edited: false,
        is_deleted: false,
        created_at: data.created_at,
        updated_at: data.created_at,
        link_preview: data.link_preview,
      };
      addMessage(data.chat_id, message);
      updateChatLastMessage(data.chat_id, message);
    });

    const unsubMessageStatus = wsManager.on("message_status", (data) => {
      if (currentChat) {
        updateMessage(currentChat.id, data.message_id, {
          status: data.status,
        });
      }
    });

    const unsubTyping = wsManager.on("typing", (data) => {
      if (currentChat?.id === data.chat_id) {
        if (data.is_typing) {
          setUserTyping(data.chat_id, data.user_id);
        } else {
          setUserNotTyping(data.chat_id, data.user_id);
        }
      }
    });

    const unsubUserStatus = wsManager.on("user_status", (data) => {
      if (data.is_online) {
        setUserOnline(data.user_id);
      } else {
        setUserOffline(data.user_id);
      }
    });

    const unsubMessageDeleted = wsManager.on("message_deleted", (data) => {
      if (currentChat?.id === data.chat_id) {
        removeMessage(data.chat_id, data.message_id);
      }
    });

    const unsubMessageEdited = wsManager.on("message_edited", (data) => {
      if (currentChat) {
        updateMessage(currentChat.id, data.message_id, {
          message_text: data.new_text,
          is_edited: true,
        });
      }
    });

    // 🔥 جدید: خطاهای اومده از سرور روی وب‌سوکت (شامل ریت‌لیمیت پیام)
    // بک‌اند فعلی شما برای ریت‌لیمیت، data = { message: "..." } می‌فرسته.
    // (اگه بعداً یه فیلد "code" هم به بک‌اند اضافه کردی، می‌تونی اینجا
    // بر اساس data.code رفتار متفاوتی نشون بدی؛ فعلاً هر خطای این کانال
    // رو به‌صورت toast هشدار نشون میدیم چون تنها خطای فعلی همینه.)
    const unsubError = wsManager.on("error", (data: any) => {
      const message =
        (data && typeof data === "object" && data.message) ||
        "خطایی رخ داد. لطفاً دوباره تلاش کنید.";
      showToast(message, "warning", 3000);
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
      unsubError();
    };
  }, [
    user?.id,
    currentChat,
    addMessage,
    updateMessage,
    removeMessage,
    setUserOnline,
    setUserOffline,
    setUserTyping,
    setUserNotTyping,
    updateChatLastMessage,
    showToast,
  ]);

  // ============================================
  // 🔄 وقتی WebSocket وصل شد، داده‌ها رو رفرش کن
  // ============================================
  useEffect(() => {
    if (isConnected) {
      loadChats();
      if (currentChat?.id) {
        loadChatMessages(currentChat.id, 20, 0);
      }
    }
  }, [isConnected, currentChat?.id, loadChatMessages, loadChats]);

  // ============================================
  // 🧠 Heartbeat برای تشخیص قطعی اینترنت
  // ============================================
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      if (!wsManager.isConnected() && wasConnectedRef.current) {
        wasConnectedRef.current = false;
        setIsConnected(false);
        if (user?.id) {
          setUserOffline(user.id);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isConnected, user?.id, setUserOffline]);

  // ============================================
  // 📤 توابع عمومی
  // ============================================
  const sendMessage = useCallback((chatId: number, messageText: string) => {
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
    wsManager.send("message_status", {
      message_id: messageId,
      status: "seen",
      seen_at: new Date().toISOString(),
    });
  }, []);

  const disconnect = useCallback(() => {
    wsManager.disconnect();
    setIsConnected(false);
    if (user?.id) {
      setUserOffline(user.id);
    }
  }, [user?.id, setUserOffline]);

  return {
    isConnected,
    isConnecting,
    sendMessage,
    sendTyping,
    markAsSeen,
    disconnect,
  };
}