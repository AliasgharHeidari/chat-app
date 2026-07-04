import React from "react";
import { Avatar } from "@/components/common/Avatar";
import styles from "./UserStatus.module.css";

interface UserStatusProps {
  name: string;
  isOnline: boolean;
  lastSeen?: string;
  initials?: string;
  profilePicUrl?: string;
  onClick?: () => void; 
}

export const UserStatus: React.FC<UserStatusProps> = ({
  name,
  isOnline,
  lastSeen,
  initials,
  profilePicUrl,
  onClick, // ✅ اضافه شد
}) => {
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