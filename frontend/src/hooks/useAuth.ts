import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    register,
    loginWithGoogle, // 🔥 جدید
    verifyEmail, // 🔥 جدید
    resendVerification, // 🔥 جدید
    getCurrentUser,
    updateProfile,
  } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (token && !user) {
      getCurrentUser().finally(() => setIsInitialized(true));
    } else {
      setIsInitialized(true);
    }
  }, [token, user, getCurrentUser]);

  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isInitialized,
    login,
    logout,
    register,
    loginWithGoogle, // 🔥 جدید
    verifyEmail, // 🔥 جدید
    resendVerification, // 🔥 جدید
    updateProfile,
  };
}