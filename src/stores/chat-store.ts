import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { isAuthUser, loginUser } from "@/lib/api/auth";
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
  isSigningIn: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
  createConversation: () => void;
  selectConversation: (conversationId: string) => void;
  sendMessage: (content: string) => void;
};

const emptyWorkspace = (): UserWorkspace => ({
  conversations: [],
  activeConversationId: null,
});

const getWorkspaceKey = (userId: string) => `user:${userId}`;

let loginAttempt = 0;
let reportStorageError: ((message: string) => void) | undefined;
let reportingStorageError = false;

function restoreUserProfile(value: unknown): UserProfile | null {
  if (!isAuthUser(value)) return null;
  const username = (value as Partial<UserProfile>).username;
  if (typeof username !== "string" || !username.trim()) return null;
  return {
    id: value.id,
    email: value.email,
    name: value.name,
    created_at: value.created_at,
    updated_at: value.updated_at,
    displayName: value.name,
    username: username.trim(),
  };
}

const createId = () => crypto.randomUUID();

const updateCurrentWorkspace = (
  state: ChatStore,
  updater: (workspace: UserWorkspace) => UserWorkspace,
) => {
  if (!state.user) {
    return state;
  }

  const key = getWorkspaceKey(state.user.id);
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
    (set) => {
      reportStorageError = (message) => set({ storageError: message });
      return {
        user: null,
        workspaces: {},
        hasHydrated: false,
        storageError: null,
        isSigningIn: false,
        setHasHydrated: (hasHydrated) => set({ hasHydrated }),
        signIn: async (username, password) => {
          const attempt = ++loginAttempt;
          set({ user: null, isSigningIn: true });
          try {
            const details = await loginUser(username, password);
            if (attempt !== loginAttempt) return;
            const user: UserProfile = {
              ...details,
              displayName: details.name,
              username: username.trim(),
            };
            const workspaceKey = getWorkspaceKey(user.id);
            set((state) => ({
              user,
              workspaces: {
                ...state.workspaces,
                [workspaceKey]: state.workspaces[workspaceKey] ?? emptyWorkspace(),
              },
            }));
          } finally {
            if (attempt === loginAttempt) set({ isSigningIn: false });
          }
        },
        signOut: () => {
          loginAttempt += 1;
          set({ user: null, isSigningIn: false });
        },
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
      };
    },
    {
      // Retain the original key so existing browser conversations remain available.
      name: "aster-chat-workspace",
      version: 3,
      // Older versions have no saved API profile; retain only their history.
      migrate: (persistedState) => ({
        workspaces: (persistedState as { workspaces?: Record<string, UserWorkspace> }).workspaces ?? {},
      }),
      storage: createJSONStorage(() => ({
        getItem: (key) => localStorage.getItem(key),
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value);
          } catch {
            if (!reportingStorageError) {
              reportingStorageError = true;
              try {
                reportStorageError?.("Browser storage could not be updated. User details or chats may not be saved, and previously saved user details may remain after sign-out.");
              } finally {
                reportingStorageError = false;
              }
            }
          }
        },
        removeItem: (key) => localStorage.removeItem(key),
      })),
      partialize: (state) => ({
        workspaces: state.workspaces,
        ...(state.user ? { user: restoreUserProfile(state.user) } : {}),
      }),
      merge: (persistedState, currentState) => {
        const saved = persistedState as { workspaces?: Record<string, UserWorkspace>; user?: unknown } | undefined;
        const user = saved?.user ? restoreUserProfile(saved.user) : null;
        return {
          ...currentState,
          workspaces: saved?.workspaces ?? {},
          user,
          isSigningIn: false,
          storageError: saved?.user && !user ? "Your saved user details are invalid. Please sign in again." : currentState.storageError,
        };
      },
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
    state.workspaces[getWorkspaceKey(state.user.id)] ?? emptyWorkspace()
  );
}
