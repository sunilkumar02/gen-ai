"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Ellipsis,
  Menu,
  Mic,
  Paperclip,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ChatSidebar } from "@/features/chat/components/chat-sidebar";
import { useChatStore, selectCurrentWorkspace } from "@/stores/chat-store";
import type { ChatMessage } from "@/types/chat";

const suggestions = [
  { icon: "✳", title: "Plan something", prompt: "Help me plan my week so I can focus on what matters." },
  { icon: "⌘", title: "Write something", prompt: "Help me write a thoughtful introduction for a new project." },
  { icon: "◉", title: "Learn something", prompt: "Explain a complex idea in a simple, memorable way." },
];

export function ChatWorkspace() {
  const user = useChatStore((state) => state.user);
  const workspace = useChatStore(selectCurrentWorkspace);
  const createConversation = useChatStore((state) => state.createConversation);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const storageError = useChatStore((state) => state.storageError);
  const [draft, setDraft] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage(draft);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage(draft);
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

  const greetingName = user?.displayName.split(" ")[0] || "there";

  return (
    <main className="chat-app">
      <ChatSidebar />
      {sidebarOpen && (
        <button className="sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />
      )}
      <section className="chat-main">
        <header className="chat-topbar">
          <button className="icon-button mobile-menu-button" type="button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
            <Menu size={19} />
          </button>
          <div className="mobile-brand"><BrandMark size={13} /> aster</div>
          <div className="model-picker">
            <span className="model-status" />
            <span>Aster assistant</span>
            <span className="model-version">PREVIEW</span>
            <ChevronDown size={14} />
          </div>
          <div className="topbar-actions">
            <span className="workspace-label">PERSONAL WORKSPACE</span>
            <button className="icon-button topbar-more" type="button" aria-label="More options"><Ellipsis size={19} /></button>
          </div>
        </header>

        {storageError && <div className="workspace-alert" role="alert">{storageError}</div>}
        {actionError && <div className="workspace-alert" role="alert">{actionError}</div>}

        <div className={`chat-content ${messages.length ? "has-messages" : ""}`}>
          {messages.length === 0 ? (
            <div className="welcome-view">
              <div className="welcome-orb"><Sparkles size={25} strokeWidth={1.6} /></div>
              <p className="eyebrow welcome-eyebrow">A LITTLE SPACE TO THINK</p>
              <h1>Good to see you, {greetingName}<span>.</span></h1>
              <p className="welcome-subtitle">What would you like to explore today?</p>
              <div className="suggestion-grid">
                {suggestions.map((suggestion) => (
                  <button
                    className="suggestion-card"
                    key={suggestion.title}
                    type="button"
                    onClick={() => submitMessage(suggestion.prompt)}
                  >
                    <span className="suggestion-icon">{suggestion.icon}</span>
                    <span><strong>{suggestion.title}</strong><small>{suggestion.prompt}</small></span>
                    <ArrowUp size={15} className="suggestion-arrow" />
                  </button>
                ))}
              </div>
              <div className="welcome-footnote"><span className="sparkle-small">✳</span> A good question can take you anywhere.</div>
            </div>
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
                    <div className="message-author">{message.role === "assistant" ? "Aster" : user?.displayName}</div>
                    <p className="message-text">{message.content}</p>
                    {message.role === "assistant" && (
                      <div className="message-actions">
                        <button type="button" onClick={() => void copyMessage(message)} aria-label="Copy response">
                          {copiedMessageId === message.id ? <Check size={14} /> : <Copy size={14} />}
                          {copiedMessageId === message.id ? "Copied" : "Copy"}
                        </button>
                        <button type="button" aria-label="Like response"><ThumbsUp size={14} /></button>
                        <button type="button" aria-label="Dislike response"><ThumbsDown size={14} /></button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
              <div ref={threadEndRef} />
            </div>
          )}
        </div>

        <div className="composer-area">
          <form className="composer" onSubmit={handleSubmit}>
            <textarea
              aria-label="Message Aster"
              placeholder="Ask anything, or start with an idea..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={1}
            />
            <div className="composer-toolbar">
              <div className="composer-tools">
                <button type="button" className="composer-tool" aria-label="Attach a file" title="Attachments coming soon"><Paperclip size={17} /></button>
                <span className="tool-divider" />
                <span className="composer-hint">Shift + Enter for a new line</span>
              </div>
              <div className="composer-submit-group">
                <button type="button" className="composer-tool mic-button" aria-label="Voice input coming soon" title="Voice input coming soon"><Mic size={16} /></button>
                <button className={`send-button ${draft.trim() ? "ready" : ""}`} type="submit" disabled={!draft.trim()} aria-label="Send message">
                  <ArrowUp size={17} />
                </button>
              </div>
            </div>
          </form>
          <div className="composer-disclaimer">
            Aster is a prototype. <span>Responses are illustrative, not AI-generated.</span>
            <button type="button" aria-label="Scroll to latest message" onClick={() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" })}>
              <ArrowDown size={12} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
