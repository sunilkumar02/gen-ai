import type { AuthUser } from "@/types/auth";

export type UserProfile = AuthUser & {
  id: string;
  displayName: string;
  username: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
};

export type UserWorkspace = {
  conversations: Conversation[];
  activeConversationId: string | null;
};
