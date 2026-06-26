import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import styles from "./Login.module.css";

interface LoginProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldErrors: Record<string, string> = {};
    if (!formData.username) fieldErrors.username = "Username is required";
    if (!formData.password) fieldErrors.password = "Password is required";

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    try {
      await login(formData.username, formData.password);
      onSuccess?.();
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Chat App</h1>
        <p className={styles.subtitle}>Login to your account</p>
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              disabled={isLoading}
            />
            {errors.username && (
              <span className={styles.fieldError}>{errors.username}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && (
              <span className={styles.fieldError}>{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="small" /> : "Login"}
          </button>
        </form>

        <p className={styles.switchText}>
          Don't have an account?{" "}
          <button onClick={onSwitchToRegister} className={styles.switchButton}>
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};
