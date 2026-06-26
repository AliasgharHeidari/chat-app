import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Login } from "@/components/auth/Login";
import { Register } from "@/components/auth/Register";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import styles from "./App.module.css";

type AuthPage = "login" | "register";

function App() {
  const { isAuthenticated, isInitialized } = useAuth();
  const [currentPage, setCurrentPage] = useState<AuthPage>("login");

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

  return <MainLayout />;
}

export default App;
