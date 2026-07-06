import React from "react";
import { Avatar } from "@/components/common/Avatar";
import { useChat } from "@/hooks/useChat";
import styles from "./UserStatus.module.css";

interface UserStatusProps {
  userId: number; // ✅ userId رو اضافه کن
  name: string;
  lastSeen?: string;
  initials?: string;
  profilePicUrl?: string;
  onClick?: () => void;
}

export const UserStatus: React.FC<UserStatusProps> = ({
  userId,
  name,
  lastSeen,
  initials,
  profilePicUrl,
  onClick,
}) => {
  const { isUserOnline } = useChat();
  const isOnline = isUserOnline(userId); // ✅ از هوک بگیر

  const statusText = isOnline
    ? "Online"
    : lastSeen
      ? `Last seen ${lastSeen}`
      : "Offline";

  return (
    <div
      className={styles.container}
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
        <p
          className={`${styles.status} ${isOnline ? styles.online : styles.offline}`}
        >
          {statusText}
        </p>
      </div>
    </div>
  );
};