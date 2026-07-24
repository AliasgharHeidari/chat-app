import React from "react";
import styles from "./TypingIndicator.module.css";

interface TypingIndicatorProps {
  userNames: string[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userNames,
}) => {
  if (userNames.length === 0) return null;

  const text =
    userNames.length === 1
      ? `${userNames[0]} is typing`
      : `${userNames.join(" and ")} are typing`;

  return (
    <div className={styles.container}>
      <span>{text}</span>
      <div className={styles.dots}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};
