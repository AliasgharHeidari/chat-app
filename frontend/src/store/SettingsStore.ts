// frontend/src/store/SettingsStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  chatBackground: string;
  setChatBackground: (background: string) => void;
  resetChatBackground: () => void;
}

const DEFAULT_BACKGROUND = "/background-images/default-image-1.jpg";

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      chatBackground: DEFAULT_BACKGROUND,
      setChatBackground: (background) => {
        console.log("🔥 Setting background:", background);
        console.log("🔥 Current state before:", get().chatBackground);
        set({ chatBackground: background });
        console.log("🔥 State after set:", get().chatBackground);
      },
      resetChatBackground: () => {
        console.log("🔥 Resetting to default");
        set({ chatBackground: DEFAULT_BACKGROUND });
      },
    }),
    {
      name: "chat-settings",
      // 🔥 اینو اضافه کن تا مطمئن بشی درست ذخیره میشه
      onRehydrateStorage: () => (state) => {
        console.log("🔥 Rehydrated state:", state);
      },
    }
  )
);