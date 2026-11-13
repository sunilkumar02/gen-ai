"use client";

import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/stores/theme-store";

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    useThemeStore.getState().initialize();
  }, []);

  return children;
}
