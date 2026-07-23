// frontend/src/components/profile/SettingsPanel.tsx
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileEditor } from "./ProfileEditor";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { BackgroundPicker } from "@/components/chat/BackgroundPicker";
import { SecurityPanel } from "./SecurityPanel"; // 🔥 جدید
import styles from "./SettingsPanel.module.css";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

// ========================================
// 🎨 آیکون‌های اینلاین (سبک، بدون وابستگی خارجی)
// ========================================
const EditIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const MoonIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ImageIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

// 🔥 جدید - آیکون امنیت
const SecurityIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const LogoutIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ChevronIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onLogout,
}) => {
  const { user } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBackgroundPickerOpen, setIsBackgroundPickerOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false); // 🔥 جدید

  const handleEditProfile = () => {
    setIsProfileOpen(true);
  };

  const handleProfileClose = () => {
    setIsProfileOpen(false);
  };

  const handleBackgroundPickerOpen = () => {
    setIsBackgroundPickerOpen(true);
  };

  const handleBackgroundPickerClose = () => {
    setIsBackgroundPickerOpen(false);
  };

  // 🔥 جدید
  const handleSecurityOpen = () => {
    setIsSecurityOpen(true);
  };

  const handleSecurityClose = () => {
    setIsSecurityOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* پنل اصلی فقط وقتی نمایش داده می‌شه که هیچ زیرصفحه‌ای باز نباشه */}
      {!isProfileOpen && !isBackgroundPickerOpen && !isSecurityOpen && (
        <div className={styles.overlay} onClick={onClose}>
          <div
            className={styles.panel}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
          >
            {/* ✨ عناصر امضادار پس‌زمینه (اورا) */}
            <div className={styles.auroraA} aria-hidden="true" />
            <div className={styles.auroraB} aria-hidden="true" />

            <div className={styles.content}>
              <div className={styles.header}>
                <h2>Settings</h2>
                <button
                  onClick={onClose}
                  className={styles.closeBtn}
                  aria-label="Close settings"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className={styles.userCard}>
                <div className={styles.avatarRing}>
                  <div className={styles.avatar}>
                    {user?.profile_pic_url ? (
                      <img src={user.profile_pic_url} alt={user.username} />
                    ) : (
                      <span>{user?.first_name?.[0] || "U"}</span>
                    )}
                  </div>
                </div>
                <div className={styles.userText}>
                  <div className={styles.userName}>
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className={styles.userUsername}>@{user?.username}</div>
                  {user?.bio && (
                    <div className={styles.userBio}>{user.bio}</div>
                  )}
                </div>
              </div>

              {/* گروه: حساب کاربری */}
              <div className={styles.sectionLabel}>Account</div>
              <div className={styles.group}>
                <button
                  className={styles.menuItem}
                  onClick={handleEditProfile}
                  type="button"
                >
                  <span className={`${styles.iconBadge} ${styles.iconIndigo}`}>
                    <EditIcon />
                  </span>
                  <span className={styles.menuLabel}>Edit Profile</span>
                  <span className={styles.arrow}>
                    <ChevronIcon />
                  </span>
                </button>
              </div>

              {/* 🔥 جدید - گروه امنیت */}
              <div className={styles.sectionLabel}>Security</div>
              <div className={styles.group}>
                <button
                  className={styles.menuItem}
                  onClick={handleSecurityOpen}
                  type="button"
                >
                  <span className={`${styles.iconBadge} ${styles.iconEmerald}`}>
                    <SecurityIcon />
                  </span>
                  <span className={styles.menuLabel}>Security</span>
                  <span className={styles.arrow}>
                    <ChevronIcon />
                  </span>
                </button>
              </div>

              {/* گروه: ظاهر */}
              <div className={styles.sectionLabel}>Appearance</div>
              <div className={styles.group}>
                <div className={styles.menuItem}>
                  <span className={`${styles.iconBadge} ${styles.iconSage}`}>
                    <MoonIcon />
                  </span>
                  <span className={styles.menuLabel}>Theme</span>
                  <div className={styles.themeToggleWrapper}>
                    <ThemeToggle />
                  </div>
                </div>

                <div className={styles.divider} />

                <button
                  className={styles.menuItem}
                  onClick={handleBackgroundPickerOpen}
                  type="button"
                >
                  <span className={`${styles.iconBadge} ${styles.iconAmber}`}>
                    <ImageIcon />
                  </span>
                  <span className={styles.menuLabel}>Chat Background</span>
                  <span className={styles.arrow}>
                    <ChevronIcon />
                  </span>
                </button>
              </div>

              <button
                className={styles.logoutBtn}
                onClick={onLogout}
                type="button"
              >
                <LogoutIcon />
                <span>Log Out</span>
              </button>

              <div className={styles.footer}>
                <span>Version 1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProfileEditor
        isOpen={isProfileOpen}
        onClose={handleProfileClose}
        onUpdate={() => {}}
      />

      {isBackgroundPickerOpen && (
        <BackgroundPicker onClose={handleBackgroundPickerClose} />
      )}

      {/* 🔥 جدید - Security Panel */}
      {isSecurityOpen && (
        <SecurityPanel isOpen={isSecurityOpen} onClose={handleSecurityClose} />
      )}
    </>
  );
};