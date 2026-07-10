import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { validateForm, validators } from "@/utils/validators";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import styles from "./Register.module.css";

interface RegisterProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const IconChat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 3C6.48 3 2 6.81 2 11.5c0 2.6 1.39 4.93 3.58 6.5-.14 1.13-.6 2.36-1.55 3.5 1.7-.13 3.16-.72 4.3-1.5.87.25 1.8.4 2.67.4 5.52 0 10-3.81 10-8.5S17.52 3 12 3Z"
      fill="currentColor"
    />
  </svg>
);

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M4.5 19.5c1.4-3.2 4.2-5 7.5-5s6.1 1.8 7.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="10.5" width="14" height="9" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path
      d="M10.6 5.7C11.05 5.6 11.52 5.5 12 5.5c6.4 0 10 6.5 10 6.5a15.6 15.6 0 0 1-3.3 4.1M6.6 6.9A15.4 15.4 0 0 0 2 12s3.6 6.5 10 6.5c1.3 0 2.5-.27 3.6-.73"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path d="M9.9 9.9a2.6 2.6 0 0 0 3.6 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const Register: React.FC<RegisterProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    bio: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
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
    // Validate form
    const fieldErrors = validateForm(formData, {
      username: validators.username,
      firstName: validators.firstName,
      lastName: validators.lastName,
      password: validators.password,
      confirmPassword: (value) => {
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return null;
      },
      bio: validators.bio,
    });
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    try {
      await register(
        formData.username,
        formData.firstName,
        formData.lastName,
        formData.password,
      );
      onSuccess?.();
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.brandPanel}>
          <div className={styles.brandGlow} aria-hidden="true" />
          <div className={styles.brandContent}>
            <div className={styles.brandHeader}>
              <span className={styles.logoMark}>
                <IconChat />
              </span>
              <span className={styles.brandName}>Chat App</span>
            </div>

            <div className={styles.brandCopy}>
              <h2 className={styles.brandHeading}>Join the conversation.</h2>
              <p className={styles.brandTagline}>
                Create an account and start chatting in seconds.
              </p>
            </div>

            <div className={styles.bubbleStack} aria-hidden="true">
              <div className={`${styles.bubble} ${styles.bubbleIncoming}`}>
                Welcome! Set up your profile to get started.
              </div>
              <div className={`${styles.bubble} ${styles.bubbleOutgoing}`}>
                Excited to be here 🎉
              </div>
              <div className={`${styles.bubble} ${styles.bubbleIncoming} ${styles.typingBubble}`}>
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
                <span className={styles.typingDot} />
              </div>
            </div>
          </div>
        </aside>

        <main className={styles.formPanel}>
          <div className={styles.formWrap}>
            <div className={styles.mobileLogo}>
              <span className={styles.logoMark}>
                <IconChat />
              </span>
              <span className={styles.brandName}>Chat App</span>
            </div>

            <h1 className={styles.title}>Create your account</h1>
            <p className={styles.subtitle}>It only takes a minute.</p>

            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <IconUser />
                  </span>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choose a username"
                    disabled={isLoading}
                    className={errors.username ? styles.inputError : undefined}
                  />
                </div>
                {errors.username && (
                  <span className={styles.fieldError}>{errors.username}</span>
                )}
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    disabled={isLoading}
                    className={`${styles.plainInput} ${errors.firstName ? styles.inputError : ""}`}
                  />
                  {errors.firstName && (
                    <span className={styles.fieldError}>{errors.firstName}</span>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    disabled={isLoading}
                    className={`${styles.plainInput} ${errors.lastName ? styles.inputError : ""}`}
                  />
                  {errors.lastName && (
                    <span className={styles.fieldError}>{errors.lastName}</span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <IconLock />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    disabled={isLoading}
                    className={errors.password ? styles.inputError : undefined}
                  />
                  <button
                    type="button"
                    className={styles.toggleVisibility}
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.password && (
                  <span className={styles.fieldError}>{errors.password}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>
                    <IconLock />
                  </span>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    className={errors.confirmPassword ? styles.inputError : undefined}
                  />
                  <button
                    type="button"
                    className={styles.toggleVisibility}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className={styles.fieldError}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="bio">Bio (Optional)</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                  disabled={isLoading}
                  rows={3}
                  className={styles.plainInput}
                />
                {errors.bio && (
                  <span className={styles.fieldError}>{errors.bio}</span>
                )}
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner size="small" /> : "Create account"}
              </button>
            </form>

            <p className={styles.switchText}>
              Already have an account?{" "}
              <button onClick={onSwitchToLogin} className={styles.switchButton}>
                Login here
              </button>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};