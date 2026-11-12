import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getMockAssistantReply } from "@/lib/chat/mock-assistant";
import type {
  ChatMessage,
  Conversation,
  UserProfile,
  UserWorkspace,
} from "@/types/chat";

type ChatStore = {
  user: UserProfile | null;
  workspaces: Record<string, UserWorkspace>;
  hasHydrated: boolean;
  storageError: string | null;
  setHasHydrated: (hasHydrated: boolean) => void;
  signIn: (displayName: string, email: string) => void;
  signOut: () => void;
  createConversation: () => void;
  selectConversation: (conversationId: string) => void;
  sendMessage: (content: string) => void;
};

const emptyWorkspace = (): UserWorkspace => ({
  conversations: [],
  activeConversationId: null,
});

const getWorkspaceKey = (email: string) => email.trim().toLowerCase();

const createId = () => crypto.randomUUID();

const updateCurrentWorkspace = (
  state: ChatStore,
  updater: (workspace: UserWorkspace) => UserWorkspace,
) => {
  if (!state.user) {
    return state;
  }

  const key = getWorkspaceKey(state.user.email);
  const workspace = state.workspaces[key] ?? emptyWorkspace();

  return {
    workspaces: {
      ...state.workspaces,
      [key]: updater(workspace),
    },
  };
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      user: null,
      workspaces: {},
      hasHydrated: false,
      storageError: null,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      signIn: (displayName, email) => {
        const normalizedEmail = getWorkspaceKey(email);
        const user: UserProfile = {
          id: normalizedEmail,
          displayName: displayName.trim(),
          email: normalizedEmail,
        };

        set((state) => ({
          user,
          workspaces: {
            ...state.workspaces,
            [normalizedEmail]: state.workspaces[normalizedEmail] ?? emptyWorkspace(),
          },
        }));
      },
      signOut: () => set({ user: null }),
      createConversation: () =>
        set((state) =>
          updateCurrentWorkspace(state, (workspace) => {
            const conversation: Conversation = {
              id: createId(),
              title: "New conversation",
              updatedAt: new Date().toISOString(),
              messages: [],
            };

            return {
              conversations: [conversation, ...workspace.conversations],
              activeConversationId: conversation.id,
            };
          }),
        ),
      selectConversation: (conversationId) =>
        set((state) =>
          updateCurrentWorkspace(state, (workspace) => ({
            ...workspace,
            activeConversationId: conversationId,
          })),
        ),
      sendMessage: (content) =>
        set((state) =>
          updateCurrentWorkspace(state, (workspace) => {
            const timestamp = new Date().toISOString();
            const userMessage: ChatMessage = {
              id: createId(),
              role: "user",
              content,
              createdAt: timestamp,
            };
            const conversation =
              workspace.conversations.find(
                (item) => item.id === workspace.activeConversationId,
              ) ??
              ({
                id: createId(),
                title: content.trim().slice(0, 42) || "New conversation",
                updatedAt: timestamp,
                messages: [],
              } satisfies Conversation);
            const isNewConversation = !workspace.conversations.some(
              (item) => item.id === conversation.id,
            );
            const updatedConversation: Conversation = {
              ...conversation,
              title:
                conversation.messages.length === 0
                  ? content.trim().slice(0, 42) || "New conversation"
                  : conversation.title,
              updatedAt: timestamp,
              messages: [
                ...conversation.messages,
                userMessage,
                {
                  id: createId(),
                  role: "assistant",
                  content: getMockAssistantReply(content),
                  createdAt: timestamp,
                },
              ],
            };

            return {
              conversations: isNewConversation
                ? [updatedConversation, ...workspace.conversations]
                : workspace.conversations.map((item) =>
                    item.id === updatedConversation.id
                      ? updatedConversation
                      : item,
                  ),
              activeConversationId: updatedConversation.id,
            };
          }),
        ),
    }),
    {
      name: "aster-chat-workspace",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        workspaces: state.workspaces,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          useChatStore.setState({
            hasHydrated: true,
            storageError: "Your saved workspace could not be loaded from this browser.",
          });
          return;
        }

        state?.setHasHydrated(true);
      },
    },
  ),
);

export function selectCurrentWorkspace(state: ChatStore): UserWorkspace {
  if (!state.user) {
    return emptyWorkspace();
  }

  return (
    state.workspaces[getWorkspaceKey(state.user.email)] ?? emptyWorkspace()
  );
}
