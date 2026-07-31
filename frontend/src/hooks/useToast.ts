// frontend/src/hooks/useToast.ts
import { useEffect, useState, useCallback } from "react";

export type ToastType = "info" | "warning" | "error" | "success";

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

// 🔥 مدیریت toast به‌صورت singleton، هم‌الگو با wsManager
// تا از هرجای اپ (حتی خارج از React، مثل داخل socket.ts) قابل فراخوانیه
class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();
  private nextId = 1;

  show(message: string, type: ToastType = "info", duration = 3500) {
    const toast: ToastItem = { id: this.nextId++, message, type, duration };
    this.toasts = [...this.toasts, toast];
    this.emit();

    setTimeout(() => {
      this.dismiss(toast.id);
    }, duration);
  }

  dismiss(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.emit();
  }

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    this.listeners.forEach((listener) => listener(this.toasts));
  }
}

export const toastManager = new ToastManager();

// 🔥 هوک برای استفاده در کامپوننت‌ها (مثلاً برای رندر کردن toastها)
export function useToastList() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  return toasts;
}

// 🔥 هوک کمکی برای نمایش toast از داخل کامپوننت‌ها
export function useToast() {
  const show = useCallback(
    (message: string, type: ToastType = "info", duration?: number) => {
      toastManager.show(message, type, duration);
    },
    [],
  );
  return { show };
}