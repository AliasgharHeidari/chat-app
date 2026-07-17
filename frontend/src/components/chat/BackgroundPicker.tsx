// frontend/src/components/chat/BackgroundPicker.tsx
import React from "react";
import { useSettingsStore } from "@/store/SettingsStore";
import styles from "./BackgroundPicker.module.css";

const BACKGROUNDS = [
  { id: "default-1", label: "Default 1", image: "/background-images/default-image-1.jpg" },
  { id: "default-2", label: "Default 2", image: "/background-images/default-image-2.jpg" },
  { id: "default-3", label: "Default 3", image: "/background-images/default-image-3.jpg" },
  { id: "default-4", label: "Default 4", image: "/background-images/default-image-4.jpg" },
];

interface BackgroundPickerProps {
  onClose: () => void;
}

export const BackgroundPicker: React.FC<BackgroundPickerProps> = ({ onClose }) => {
  const { chatBackground, setChatBackground } = useSettingsStore();

  const handleSelect = (image: string) => {
    console.log("🔥 Selected background:", image);
    setChatBackground(image);
    
    // 🔥 با تاخیر ببند تا store ذخیره بشه
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.picker} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Choose Chat Background</h3>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>

        <div className={styles.grid}>
          {BACKGROUNDS.map((bg) => (
            <div
              key={bg.id}
              className={`${styles.option} ${chatBackground === bg.image ? styles.active : ""}`}
              onClick={() => handleSelect(bg.image)}
            >
              <div
                className={styles.preview}
                style={{ backgroundImage: `url(${bg.image})` }}
              />
              <span className={styles.label}>{bg.label}</span>
              {chatBackground === bg.image && (
                <div className={styles.checkmark}>✓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};