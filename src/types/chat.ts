export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
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
