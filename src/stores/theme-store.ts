import { create } from "zustand";

type Theme = "light" | "dark";
type ThemeStore = {
  theme: Theme;
  storageError: string | null;
  initialize: () => void;
  toggle: () => void;
};

const storageKey = "ai-assist-theme";

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: "light",
  storageError: null,
  initialize: () => {
    let theme: Theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    let storageError: string | null = null;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "light" || saved === "dark") theme = saved;
    } catch {
      storageError = "Your theme preference could not be loaded in this browser.";
    }
    document.documentElement.dataset.theme = theme;
    set({ theme, storageError });
  },
  toggle: () => {
    const theme = get().theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    let storageError: string | null = null;
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      storageError = "Theme changed, but your preference could not be saved in this browser.";
    }
    set({ theme, storageError });
  },
}));
