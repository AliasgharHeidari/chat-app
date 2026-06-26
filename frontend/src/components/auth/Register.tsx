import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { validateForm, validators } from "@/utils/validators";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import styles from "./Register.module.css";

interface RegisterProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

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
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>
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
              placeholder="Choose a username"
              disabled={isLoading}
            />
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
              />
              {errors.lastName && (
                <span className={styles.fieldError}>{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              disabled={isLoading}
            />
            {errors.password && (
              <span className={styles.fieldError}>{errors.password}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
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
            {isLoading ? <LoadingSpinner size="small" /> : "Create Account"}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{" "}
          <button onClick={onSwitchToLogin} className={styles.switchButton}>
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};
