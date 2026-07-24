// frontend/src/components/profile/SecurityPanel.tsx
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/api/rest";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import styles from "./SecurityPanel.module.css";

interface SecurityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// ========================================
// 🎨 آیکون‌های اینلاین
// ========================================
const LockIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const KeyIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const ShieldIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ChevronIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const EyeIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const SecurityPanel: React.FC<SecurityPanelProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"main" | "change-password">("main");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // 🔥 Regex برای فقط انگلیسی
  const englishOnlyRegex = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;

  const checkPasswordStrength = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    return score;
  };

  const getStrengthInfo = (score: number) => {
    switch (score) {
      case 0:
        return { label: "Very Weak", color: "#ff6b6b", barColor: "#ff6b6b" };
      case 1:
        return { label: "Weak", color: "#ff6b6b", barColor: "#ff6b6b" };
      case 2:
        return { label: "Medium", color: "#ff8c42", barColor: "#ff8c42" };
      case 3:
        return { label: "Good", color: "#f1c40f", barColor: "#f1c40f" };
      case 4:
        return { label: "Strong", color: "#2ecc71", barColor: "#2ecc71" };
      default:
        return { label: "", color: "", barColor: "" };
    }
  };

  // 🔥 فقط کاراکترهای انگلیسی مجاز
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || englishOnlyRegex.test(value)) {
      setNewPassword(value);
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  if (!isOpen) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword) {
      setError("Current password is required");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    if (passwordStrength < 3) {
      setError("Please choose a stronger password (Good or Strong required)");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await api.changePassword({ current_password: currentPassword, new_password: newPassword });
      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStrength(0);
      setTimeout(() => {
        setActiveTab("main");
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================
  // صفحه اصلی Security
  // ========================================
  if (activeTab === "main") {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
          <div className={styles.header}>
            <h2>Security</h2>
            <button onClick={onClose} className={styles.closeBtn}>×</button>
          </div>

          <div className={styles.content}>
            <p className={styles.subtitle}>
              Manage your account security settings
            </p>

            <div className={styles.optionsList}>
              <div
                className={styles.optionItem}
                onClick={() => setActiveTab("change-password")}
              >
                <div className={styles.optionIcon}>
                  <LockIcon />
                </div>
                <div className={styles.optionContent}>
                  <div className={styles.optionTitle}>Change Password</div>
                  <div className={styles.optionDesc}>
                    Update your password to keep your account secure
                  </div>
                </div>
                <div className={styles.optionArrow}>
                  <ChevronIcon />
                </div>
              </div>

              <div className={`${styles.optionItem} ${styles.disabled}`}>
                <div className={styles.optionIcon}>
                  <KeyIcon />
                </div>
                <div className={styles.optionContent}>
                  <div className={styles.optionTitle}>Two-Factor Authentication</div>
                  <div className={styles.optionDesc}>
                    Add an extra layer of security (coming soon)
                  </div>
                </div>
                <div className={styles.optionBadge}>Soon</div>
              </div>

              <div className={`${styles.optionItem} ${styles.disabled}`}>
                <div className={styles.optionIcon}>
                  <ShieldIcon />
                </div>
                <div className={styles.optionContent}>
                  <div className={styles.optionTitle}>Active Sessions</div>
                  <div className={styles.optionDesc}>
                    Manage your active devices and sessions (coming soon)
                  </div>
                </div>
                <div className={styles.optionBadge}>Soon</div>
              </div>
            </div>

            <button className={styles.backBtn} onClick={onClose}>
              Back to Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // صفحه Change Password
  // ========================================
  const strengthInfo = getStrengthInfo(passwordStrength);

  return (
    <div className={styles.overlay} onClick={() => setActiveTab("main")}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button
            onClick={() => setActiveTab("main")}
            className={styles.backBtnHeader}
            aria-label="Back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2>Change Password</h2>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>

        <div className={styles.content}>
          <p className={styles.subtitle}>
            Enter your current password and choose a new one
          </p>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <form onSubmit={handleChangePassword} className={styles.form}>
            {/* Current Password */}
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Current Password</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.togglePasswordBtn}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className={styles.formGroup}>
              <label htmlFor="newPassword">New Password</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  placeholder="Enter new password (min 8 chars, English only)"
                  disabled={isLoading}
                  spellCheck={false}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.togglePasswordBtn}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Password Strength Meter */}
            {newPassword && (
              <div className={styles.strengthContainer}>
                <div className={styles.strengthBars}>
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`${styles.strengthBar} ${
                        i < passwordStrength ? styles.active : ""
                      }`}
                      style={{
                        backgroundColor:
                          i < passwordStrength ? strengthInfo.barColor : undefined,
                      }}
                    />
                  ))}
                </div>
                <div className={styles.strengthLabel}>
                  <span style={{ color: strengthInfo.color }}>
                    {strengthInfo.label}
                  </span>
                </div>
              </div>
            )}

            {/* لیست معیارها */}
            {isPasswordFocused && newPassword && (
              <ul className={styles.criteriaList}>
                <li className={newPassword.length >= 8 ? styles.met : styles.unmet}>
                  <span className={styles.criteriaIcon}>
                    {newPassword.length >= 8 ? "✓" : "✗"}
                  </span>
                  At least 8 characters
                </li>
                <li className={/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? styles.met : styles.unmet}>
                  <span className={styles.criteriaIcon}>
                    {/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? "✓" : "✗"}
                  </span>
                  Uppercase & lowercase
                </li>
                <li className={/\d/.test(newPassword) ? styles.met : styles.unmet}>
                  <span className={styles.criteriaIcon}>
                    {/\d/.test(newPassword) ? "✓" : "✗"}
                  </span>
                  At least one number
                </li>
                <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? styles.met : styles.unmet}>
                  <span className={styles.criteriaIcon}>
                    {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? "✓" : "✗"}
                  </span>
                  Special character
                </li>
              </ul>
            )}

            {/* Confirm Password */}
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className={styles.togglePasswordBtn}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? <LoadingSpinner size="small" /> : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};