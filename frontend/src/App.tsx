import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Login } from "@/components/auth/Login";
import { Register } from "@/components/auth/Register";
import { VerifyEmail } from "@/components/auth/VerifyEmail";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ToastContainer } from "@/components/common/Toast";
import styles from "./App.module.css";

function AppContent() {
  const { isAuthenticated, isInitialized } = useAuth();
  const [currentPage, setCurrentPage] = useState<"login" | "register" | "verify">("login");

  if (!isInitialized) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner fullScreen size="large" />
      </div>
    );
  }

  // اگر کاربر لاگین نکرده
  if (!isAuthenticated) {
    // صفحه تایید ایمیل
    if (currentPage === "verify") {
      return (
        <VerifyEmail
          onSuccess={() => setCurrentPage("login")}
          onBackToLogin={() => setCurrentPage("login")}
        />
      );
    }

    // صفحه لاگین / ثبت‌نام
    return (
      <div className={styles.authContainer}>
        {currentPage === "login" ? (
          <Login
            onSuccess={() => {
              window.location.href = "/";
            }}
            onSwitchToRegister={() => setCurrentPage("register")}
          />
        ) : (
          <Register
            onSuccess={() => {
              // بعد از ثبت‌نام موفق، بره به صفحه تایید ایمیل
              setCurrentPage("verify");
            }}
            onSwitchToLogin={() => setCurrentPage("login")}
          />
        )}
      </div>
    );
  }

  // کاربر لاگین کرده
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />} />
        <Route path="/chat/:chatId" element={<ChatRoom />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      {/* 🔥 قبلاً import شده بود ولی هیچ‌جا رندر نمی‌شد، پس toast هیچ‌وقت دیده نمی‌شد */}
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;