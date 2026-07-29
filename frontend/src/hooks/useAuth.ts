// frontend/src/hooks/useAuth.ts
import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const {
    user,
    isLoading,
    error,
    login,
    logout,
    register,
    loginWithGoogle,
    verifyEmail,
    resendVerification,
    getCurrentUser,
    updateProfile,
  } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const hasCheckedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    // فقط یکبار اجرا بشه
    if (!hasCheckedRef.current) {
      hasCheckedRef.current = true;
      if (!user) {
        getCurrentUser()
          .catch(() => {})
          .finally(() => setIsInitialized(true));
      } else {
        setIsInitialized(true);
      }
    }
  }, []); // ← وابستگی خالی

  const handleLogout = async () => {
    await logout();
    // ریست کن برای لاگین بعدی
    hasCheckedRef.current = false;
    navigate("/login");
  };

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isInitialized,
    login,
    logout: handleLogout,
    register,
    loginWithGoogle,
    verifyEmail,
    resendVerification,
    updateProfile,
  };
}