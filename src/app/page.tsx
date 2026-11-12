"use client";

import { LoginScreen } from "@/features/auth/components/login-screen";
import { ChatWorkspace } from "@/features/chat/components/chat-workspace";
import { useChatStore } from "@/stores/chat-store";

export default function Home() {
  const user = useChatStore((state) => state.user);
  const hasHydrated = useChatStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    return <main className="app-loading" aria-label="Loading workspace" />;
  }

  return user ? <ChatWorkspace /> : <LoginScreen />;
}
