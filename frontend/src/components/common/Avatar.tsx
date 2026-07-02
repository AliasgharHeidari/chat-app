import React from "react";
import styles from "./Avatar.module.css";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "small" | "medium" | "large";
  isOnline?: boolean;
  initials?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User avatar",
  size = "medium",
  isOnline = false,
  initials = "?",
}) => {
  const avatarClass = `${styles.avatar} ${styles[size]}`;

  return (
    <div className={styles.container}>
      <div className={avatarClass}>
        {src ? (
          <img 
            src={src} 
            alt={alt} 
            className={styles.image}
            onError={(e) => {
              // اگه عکس لود نشد، مخفی کن و initials رو نشون بده
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className={styles.placeholder}>{initials}</div>
        )}
      </div>
      {isOnline && <div className={styles.onlineIndicator}></div>}
    </div>
  );
};