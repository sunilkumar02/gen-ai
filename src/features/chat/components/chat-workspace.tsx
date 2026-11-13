"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatPrompt } from "@/features/chat/components/chat-prompt";
import { ChatSidebar } from "@/features/chat/components/chat-sidebar";
import { useChatStore, selectCurrentWorkspace } from "@/stores/chat-store";
import type { ChatMessage } from "@/types/chat";

export function ChatWorkspace() {
  const user = useChatStore((state) => state.user);
  const workspace = useChatStore(selectCurrentWorkspace);
  const createConversation = useChatStore((state) => state.createConversation);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const storageError = useChatStore((state) => state.storageError);
  const [draft, setDraft] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = workspace.conversations.find(
    (conversation) => conversation.id === workspace.activeConversationId,
  );
  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  function submitMessage(content: string) {
    const normalizedContent = content.trim();
    if (!normalizedContent) {
      return;
    }

    try {
      setActionError(null);
      if (!workspace.activeConversationId) {
        createConversation();
      }
      sendMessage(normalizedContent);
      setDraft("");
    } catch {
      setActionError("Your message couldn't be saved. Please try again.");
    }
  }

  async function copyMessage(message: ChatMessage) {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      window.setTimeout(() => setCopiedMessageId(null), 1500);
    } catch {
      setActionError("Couldn't copy that response. Check your browser permissions.");
    }
  }

  return (
    <main className="chat-app">
      <ChatSidebar />
      <section className="chat-main" id="workspace" aria-label="AI Assist">
        <header className="chat-topbar">
          <div className="topbar-actions"><ThemeToggle /></div>
        </header>

        {storageError && <div className="workspace-alert" role="alert">{storageError}</div>}
        {actionError && <div className="workspace-alert" role="alert">{actionError}</div>}

        <div className={`workspace-body ${messages.length ? "has-messages" : "is-empty"}`}>
          <div className="chat-content">
            {messages.length === 0 ? (
              <div className="welcome-view"><h1>Ready when you are.</h1></div>
            ) : (
              <div className="message-thread">
                <div className="thread-title">
                  <span className="thread-title-icon"><Sparkles size={14} /></span>
                  <span>{activeConversation?.title}</span>
                </div>
                {messages.map((message) => (
                  <article className={`message-row ${message.role}`} key={message.id}>
                    {message.role === "assistant" ? (
                      <span className="assistant-avatar"><Sparkles size={14} /></span>
                    ) : (
                      <span className="user-avatar">{user?.displayName.slice(0, 1).toUpperCase()}</span>
                    )}
                    <div className="message-body">
                      <div className="message-author">{message.role === "assistant" ? "AI Assist" : user?.displayName}</div>
                      <p className="message-text">{message.content}</p>
                      {message.role === "assistant" && (
                        <div className="message-actions">
                          <button type="button" onClick={() => void copyMessage(message)} aria-label="Copy response">
                            {copiedMessageId === message.id ? <Check size={14} /> : <Copy size={14} />}
                            {copiedMessageId === message.id ? "Copied" : "Copy"}
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
                <div ref={threadEndRef} />
              </div>
            )}
          </div>

          <ChatPrompt value={draft} onChange={setDraft} onSubmit={submitMessage} />
        </div>
        <p className="composer-disclaimer">AI Assist is a prototype. Responses are illustrative, not AI-generated.</p>
      </section>
    </main>
  );
}
