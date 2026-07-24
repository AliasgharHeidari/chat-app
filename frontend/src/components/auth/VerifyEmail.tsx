import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import styles from "./VerifyEmail.module.css";

interface VerifyEmailProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

const IconMail = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
      stroke="#4a6cf7"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M22 6L12 13L2 6"
      stroke="#4a6cf7"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const VerifyEmail: React.FC<VerifyEmailProps> = ({
  onSuccess,
  onBackToLogin,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmail, resendVerification, isLoading, error } = useAuth();

  const [code, setCode] = useState("");
  // 🔥 ایمیل رو از location.state بگیر
  const [email, setEmail] = useState<string>(() => {
    const state = location.state as { email?: string } | null;
    return state?.email || "";
  });
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!code || code.length !== 6) {
      setErrors({ code: "Please enter a valid 6-digit verification code" });
      return;
    }

    setErrors({});
    try {
      await verifyEmail(email, code);
      onSuccess?.();
    } catch (err) {
      // خطا توسط store مدیریت میشه
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }

    setIsResending(true);
    setResendMessage("");
    try {
      await resendVerification(email);
      setResendMessage("✅ Verification code resent successfully!");
    } catch (err) {
      setResendMessage("❌ Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <IconMail />
        </div>

        <h1 className={styles.title}>Verify Your Email</h1>

        <p className={styles.subtitle}>
          We've sent a 6-digit verification code to{" "}
          <strong>{email || "your email"}</strong>.
          <br />
          Please enter the code below to activate your account.
        </p>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        {resendMessage && (
          <div
            className={
              resendMessage.includes("✅") ? styles.success : styles.error
            }
          >
            {resendMessage}
          </div>
        )}

        <form onSubmit={handleVerify} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
              className={errors.email ? styles.inputError : undefined}
            />
            {errors.email && (
              <span className={styles.fieldError}>{errors.email}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="code">Verification Code</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.slice(0, 6))}
              placeholder="Enter 6-digit code"
              disabled={isLoading}
              maxLength={6}
              className={errors.code ? styles.inputError : undefined}
            />
            {errors.code && (
              <span className={styles.fieldError}>{errors.code}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.verifyButton}
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="small" /> : "Verify Email"}
          </button>
        </form>

        <div className={styles.actions}>
          <button
            onClick={handleResend}
            className={styles.resendButton}
            disabled={isResending}
          >
            {isResending ? "Sending..." : "Resend Code"}
          </button>

          <button
            onClick={onBackToLogin || (() => navigate("/login"))}
            className={styles.backButton}
          >
            Back to Login
          </button>
        </div>

        <p className={styles.hint}>
          Didn't receive the email? Check your spam folder or click "Resend
          Code".
        </p>
      </div>
    </div>
  );
};
