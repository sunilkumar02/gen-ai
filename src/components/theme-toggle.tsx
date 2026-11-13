"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggle = useThemeStore((state) => state.toggle);
  const storageError = useThemeStore((state) => state.storageError);

  return (
    <div className="theme-control">
      <button className="theme-toggle" type="button" onClick={toggle} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`} title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
        {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        <span>{theme === "light" ? "Dark" : "Light"}</span>
      </button>
      {storageError && <p className="theme-error" role="alert">{storageError}</p>}
    </div>
  );
}
