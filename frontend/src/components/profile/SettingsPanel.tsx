import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileEditor } from "./ProfileEditor";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import styles from "./SettingsPanel.module.css";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleEditProfile = () => {
    setIsProfileOpen(true);
    // پنل رو باز نگه میداریم ولی با لایه جدا
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* پنل تنظیمات - وقتی ادیت پروفایل بازه، پنل رو مخفی کن */}
      {!isProfileOpen && (
        <div className={styles.overlay} onClick={onClose}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <h2>⚙️ Settings</h2>
              <button onClick={onClose} className={styles.closeBtn}>×</button>
            </div>

            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {user?.profile_pic_url ? (
                  <img src={user.profile_pic_url} alt={user.username} />
                ) : (
                  <span>{user?.first_name?.[0] || "U"}</span>
                )}
              </div>
              <div>
                <div className={styles.userName}>
                  {user?.first_name} {user?.last_name}
                </div>
                <div className={styles.userUsername}>@{user?.username}</div>
              </div>
            </div>

            <div className={styles.menuList}>
              <div
                className={styles.menuItem}
                onClick={handleEditProfile}
              >
                <span className={styles.menuIcon}></span>
                <span>Edit Profile</span>
                <span className={styles.arrow}>›</span>
              </div>

              <div className={styles.menuItem}>
                <span className={styles.menuIcon}>🌓</span>
                <span>Theme</span>
                <div className={styles.themeToggleWrapper}>
                  <ThemeToggle />
                </div>
              </div>

              <div
                className={`${styles.menuItem} ${styles.logoutItem}`}
                onClick={handleLogout}
              >
                <span className={styles.logoutText}>Logout</span>
              </div>
            </div>

            <div className={styles.footer}>
              <span>Version 1.0.0</span>
            </div>
          </div>
        </div>
      )}

      {/* ✅ مودال ویرایش پروفایل (جدا و روی همه چیز) */}
      <ProfileEditor
        isOpen={isProfileOpen}
        onClose={handleProfileClose}
        onUpdate={() => {}}
      />
    </>
  );
};