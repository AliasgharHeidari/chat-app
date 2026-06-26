import React from "react";
import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  fullScreen = false,
}) => {
  const spinnerClass = `${styles.spinner} ${styles[size]}`;

  if (fullScreen) {
    return (
      <div className={styles.fullScreenContainer}>
        <div className={spinnerClass}></div>
      </div>
    );
  }

  return <div className={spinnerClass}></div>;
};
