import React from "react";
import { User } from "@/types";
import { Avatar } from "@/components/common/Avatar";
import styles from "./UserProfileModal.module.css";

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onStartChat,
}) => {
  if (!isOpen || !user) return null;

  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        <div className={styles.profileHeader}>
          <Avatar
            src={user.profile_pic_url}
            initials={user.first_name?.[0] || "U"}
            size="large"
            isOnline={user.is_online}
          />
          <h2 className={styles.fullName}>{fullName}</h2>
          <p className={styles.username}>@{user.username}</p>
        </div>

        <div className={styles.profileBody}>
          {user.bio && (
            <div className={styles.bioSection}>
              <span className={styles.label}>Bio</span>
              <p className={styles.bio}>{user.bio}</p>
            </div>
          )}

          <div className={styles.statusSection}>
            <span className={styles.label}>Status</span>
            <p className={user.is_online ? styles.online : styles.offline}>
              {user.is_online ? "Online" : "Offline"}
            </p>
          </div>

          {user.last_seen && !user.is_online && (
            <div className={styles.lastSeen}>
              Last seen: {new Date(user.last_seen).toLocaleString()}
            </div>
          )}
        </div>

        {onStartChat && (
          <div className={styles.actions}>
            <button onClick={onStartChat} className={styles.chatBtn}>
              💬 Send Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
};