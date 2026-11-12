"use client";

import {
  ChevronDown,
  CircleHelp,
  Command,
  LogOut,
  MessageSquareText,
  Plus,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { useChatStore, selectCurrentWorkspace } from "@/stores/chat-store";

export function ChatSidebar() {
  const user = useChatStore((state) => state.user);
  const workspace = useChatStore(selectCurrentWorkspace);
  const createConversation = useChatStore((state) => state.createConversation);
  const selectConversation = useChatStore((state) => state.selectConversation);
  const signOut = useChatStore((state) => state.signOut);
  const [search, setSearch] = useState("");

  const conversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return workspace.conversations.filter((conversation) =>
      conversation.title.toLowerCase().includes(query),
    );
  }, [search, workspace.conversations]);

  const initials = user?.displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="chat-sidebar">
      <div className="sidebar-brand-row">
        <Link className="brand-lockup sidebar-brand" href="/" aria-label="Aster home">
          <BrandMark />
          <span>aster</span>
        </Link>
        <button className="icon-button sidebar-collapse" type="button" aria-label="Collapse sidebar">
          <Command size={15} />
        </button>
      </div>

      <button className="workspace-switcher" type="button">
        <span className="workspace-glyph">a</span>
        <span className="workspace-switcher-copy"><strong>My workspace</strong><small>Personal space</small></span>
        <ChevronDown size={15} />
      </button>

      <button className="new-chat-button" type="button" onClick={createConversation}>
        <Plus size={16} /> New chat <span className="shortcut">⌘ K</span>
      </button>

      <div className="sidebar-search">
        <Search size={15} />
        <input
          aria-label="Search conversations"
          placeholder="Search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <span className="search-shortcut">⌘ /</span>
      </div>

      <nav className="sidebar-navigation" aria-label="Workspace navigation">
        <p className="sidebar-section-label">WORKSPACE</p>
        <button className="nav-item active" type="button">
          <MessageSquareText size={16} /> Chats
          <span className="nav-count">{workspace.conversations.length}</span>
        </button>
        <button className="nav-item" type="button" disabled title="Coming soon">
          <Sparkles size={16} /> Explore agents <span className="coming-soon">SOON</span>
        </button>
        <button className="nav-item" type="button" disabled title="Coming soon">
          <Settings2 size={16} /> Integrations <span className="coming-soon">SOON</span>
        </button>

        <div className="conversation-section">
          <div className="conversation-heading">
            <p className="sidebar-section-label">RECENT</p>
            <button type="button" className="text-icon-button" onClick={createConversation} aria-label="Start a new chat">
              <Plus size={15} />
            </button>
          </div>
          {conversations.length > 0 ? (
            <div className="conversation-list">
              {conversations.map((conversation) => (
                <button
                  className={`conversation-link ${workspace.activeConversationId === conversation.id ? "selected" : ""}`}
                  key={conversation.id}
                  type="button"
                  onClick={() => selectConversation(conversation.id)}
                  title={conversation.title}
                >
                  <MessageSquareText size={14} />
                  <span>{conversation.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="empty-sidebar-copy">
              {search ? "No chats match your search." : "Your conversations will appear here."}
            </p>
          )}
        </div>
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-item help-item" type="button" title="Help">
          <CircleHelp size={16} /> Help center
        </button>
        <div className="sidebar-profile">
          <span className="profile-avatar">{initials || "A"}</span>
          <span className="profile-copy"><strong>{user?.displayName}</strong><small>{user?.email}</small></span>
          <button className="icon-button signout-button" type="button" onClick={signOut} aria-label="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
