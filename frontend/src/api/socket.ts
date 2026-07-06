import type {
  WSMessage,
  WSNewMessage,
  WSNewMessageRequest,
  WSMessageStatus,
  WSMessageStatusRequest,
  WSTyping,
  WSTypingRequest,
  WSUserStatus,
  WSMessageDeleted,
  WSMessageEdited,
} from "@/types";

type WSEventHandler<T = unknown> = (data: T) => void;
type WSEventType =
  | "new_message"
  | "message_status"
  | "typing"
  | "user_status"
  | "message_deleted"
  | "message_edited"
  | "ping"
  | "pong"
  | "connect"
  | "disconnect"
  | "error";

interface WSEventMap {
  new_message: WSNewMessage;
  message_status: WSMessageStatus;
  typing: WSTyping;
  user_status: WSUserStatus;
  message_deleted: WSMessageDeleted;
  message_edited: WSMessageEdited;
  connect: void;
  disconnect: void;
  error: { message: string };
  ping: void;
  pong: void;
}

interface WSSendMap {
  new_message: WSNewMessageRequest;
  message_status: WSMessageStatusRequest;
  typing: WSTypingRequest;
  ping: {};
  pong: {};
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private handlers: Map<WSEventType, Set<WSEventHandler<unknown>>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isIntentionallyClosed = false;
  private messageBuffer: WSMessage<unknown>[] = [];
  private maxBufferSize = 100;
  private pingInterval: ReturnType<typeof setInterval> | null = null; // ✅ اصلاح شد

  constructor() {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    this.url = apiUrl.replace(/^http/, "ws");
  }

  setToken(token: string | null) {
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.token) {
        reject(new Error("Token not set"));
        return;
      }

      try {
        this.isIntentionallyClosed = false;
        const wsUrl = `${this.url}/ws/chat?token=${this.token}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log("WebSocket connected");
          this.reconnectAttempts = 0;
          this.startPingPong();
          this.flushMessageBuffer();
          this.emit("connect", undefined);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Failed to parse WS message:", error);
          }
        };

        this.ws.onerror = (event) => {
          console.error("WebSocket error:", event);
          this.emit("error", { message: "WebSocket connection error" });
          reject(new Error("WebSocket connection failed"));
        };

        this.ws.onclose = () => {
          console.log("WebSocket disconnected");
          this.stopPingPong();
          if (!this.isIntentionallyClosed) {
            this.emit("disconnect", undefined);
            this.attemptReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

disconnect() {
    this.isIntentionallyClosed = true; // ✅ جلوگیری از reconnect
    this.stopPingPong();
    if (this.ws) {
        this.ws.close();
        this.ws = null;
    }
}

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnect attempts reached");
      this.emit("error", {
        message: "Connection lost. Please refresh the page.",
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`Attempting to reconnect in ${delay}ms...`);

    setTimeout(() => {
      if (!this.isIntentionallyClosed) {
        this.connect().catch((error) => {
          console.error("Reconnect failed:", error);
        });
      }
    }, delay);
  }

  private startPingPong() {
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send("ping", {});
      }
    }, 30000);
  }

  private stopPingPong() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private handleMessage(message: WSMessage<unknown>) {
    const type = message.type as WSEventType;
    if (type === "pong") {
      return;
    }
    this.emit(type, message.data as WSEventMap[typeof type]);
  }

  private flushMessageBuffer() {
    while (this.messageBuffer.length > 0 && this.isConnected()) {
      const message = this.messageBuffer.shift();
      if (message) {
        this.ws?.send(JSON.stringify(message));
      }
    }
  }

  send<T extends keyof WSSendMap>(type: T, data: WSSendMap[T]): void {
    const message: WSMessage = {
      type,
      data,
      timestamp: Date.now(),
    };

    if (this.isConnected() && this.ws) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    } else {
      if (this.messageBuffer.length < this.maxBufferSize) {
        this.messageBuffer.push(message);
      } else {
        console.warn("Message buffer full, dropping message");
      }
    }
  }

  on<T extends keyof WSEventMap>(
    type: T,
    handler: WSEventHandler<WSEventMap[T]>,
  ): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler as WSEventHandler<unknown>);
    return () => {
      this.handlers.get(type)?.delete(handler as WSEventHandler<unknown>);
    };
  }

  once<T extends keyof WSEventMap>(
    type: T,
    handler: WSEventHandler<WSEventMap[T]>,
  ): void {
    const unsubscribe = this.on(type, (data: WSEventMap[T]) => {
      handler(data);
      unsubscribe();
    });
  }

  private emit<T extends keyof WSEventMap>(type: T, data: WSEventMap[T]): void {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${type} handler:`, error);
        }
      });
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  isConnecting(): boolean {
    return this.ws?.readyState === WebSocket.CONNECTING;
  }
}

export const wsManager = new WebSocketManager();