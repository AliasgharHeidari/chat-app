import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/api/rest";
import { User } from "@/types";
import styles from "./ProfileEditor.module.css";

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    bio: "",
    profile_pic_url: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || "",
        profile_pic_url: user.profile_pic_url || "",
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const updatedUser = await api.updateProfile(formData);
      setUser(updatedUser);
      onUpdate(updatedUser);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Edit Profile</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              minLength={3}
              maxLength={50}
            />
          </div>

          <div className={styles.field}>
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className={styles.field}>
            <label>Profile Picture URL</label>
            <input
              type="url"
              name="profile_pic_url"
              value={formData.profile_pic_url}
              onChange={handleChange}
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.saveBtn}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};