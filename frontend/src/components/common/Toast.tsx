// frontend/src/components/common/Toast.tsx
import React from "react";
import { useToastList, toastManager } from "@/hooks/useToast";
import styles from "./Toast.module.css";

export const ToastContainer: React.FC = () => {
  const toasts = useToastList();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          onClick={() => toastManager.dismiss(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};