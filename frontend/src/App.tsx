import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Login } from "@/components/auth/Login";
import { Register } from "@/components/auth/Register";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import styles from "./App.module.css";

function AppContent() {
  const { isAuthenticated, isInitialized } = useAuth();
  const [currentPage, setCurrentPage] = useState<"login" | "register">("login");

  if (!isInitialized) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner fullScreen size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.authContainer}>
        {currentPage === "login" ? (
          <Login onSwitchToRegister={() => setCurrentPage("register")} />
        ) : (
          <Register onSwitchToLogin={() => setCurrentPage("login")} />
        )}
      </div>
    );
  }

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
    </BrowserRouter>
  );
}

export default App;