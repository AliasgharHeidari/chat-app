import React from "react";
import { Avatar } from "@/components/common/Avatar";
import { useChat } from "@/hooks/useChat";
import styles from "./UserStatus.module.css";

interface UserStatusProps {
  userId: number;
  name: string;
  lastSeen?: string;
  initials?: string;
  profilePicUrl?: string;
  isTyping?: boolean;
  onClick?: () => void;
}

export const UserStatus: React.FC<UserStatusProps> = ({
  userId,
  name,
  lastSeen,
  initials,
  profilePicUrl,
  isTyping = false,
  onClick,
}) => {
  const { isUserOnline } = useChat();
  const isOnline = isUserOnline(userId);
  const statusText = isOnline
    ? "Online"
    : lastSeen
      ? `Last seen ${lastSeen}`
      : "Offline";

  return (
    <div
      className={`${styles.container} ${isTyping ? styles.typingGlow : ""}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <Avatar
        src={profilePicUrl}
        initials={initials}
        size="medium"
        isOnline={isOnline}
      />
      <div className={styles.info}>
        <h2 className={styles.name}>{name}</h2>
        {isTyping ? (
          <p className={`${styles.status} ${styles.typing}`}>
            <span>typing</span>
            <span className={styles.typingDots}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </p>
        ) : (
          <p
            className={`${styles.status} ${isOnline ? styles.online : styles.offline}`}
          >
            {isOnline && <span className={styles.dot} aria-hidden="true" />}
            {statusText}
          </p>
        )}
      </div>
    </div>
  );
};