"use client";

import { LogOut, MessageCircle, SquarePen, X } from "lucide-react";
import { useMemo, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { useChatStore, selectCurrentWorkspace } from "@/stores/chat-store";

export function ChatSidebar() {
  const user = useChatStore((state) => state.user);
  const workspace = useChatStore(selectCurrentWorkspace);
  const createConversation = useChatStore((state) => state.createConversation);
  const selectConversation = useChatStore((state) => state.selectConversation);
  const signOut = useChatStore((state) => state.signOut);
  const [panel, setPanel] = useState<"history" | "profile" | null>(null);
  const [search, setSearch] = useState("");
  const conversations = useMemo(() => workspace.conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(search.trim().toLowerCase()),
  ), [search, workspace.conversations]);
  const initials = user?.displayName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  function togglePanel(next: typeof panel) {
    setSearch("");
    setPanel(panel === next ? null : next);
  }

  return (
    <aside className="chat-sidebar" aria-label="AI Assist navigation" onKeyDown={(event) => {
      if (event.key === "Escape") setPanel(null);
    }}>
      <a href="#workspace" className="rail-brand" aria-label="AI Assist workspace" title="AI Assist"><BrandMark size={25} /></a>
      <nav className="rail-navigation" aria-label="Workspace">
        <button className="rail-button active" type="button" title="New chat" aria-label="New chat" onClick={() => { createConversation(); setPanel(null); }}><SquarePen size={23} /></button>
        <button className="rail-button" type="button" title="Chat history" aria-label="Chat history" aria-expanded={panel === "history"} aria-controls="sidebar-panel" onClick={() => togglePanel("history")}><MessageCircle size={23} /></button>
      </nav>
      <button className="profile-avatar" type="button" title={user?.displayName ?? "Your profile"} aria-label="Your profile and sign out" aria-expanded={panel === "profile"} aria-controls="sidebar-panel" onClick={() => togglePanel("profile")}>{initials || "AI"}</button>
      {panel && (
        <section className="sidebar-panel" id="sidebar-panel" aria-label={panel === "profile" ? "Your profile" : "Conversations"}>
          <div className="panel-heading">
            <h2>{panel === "profile" ? "Your profile" : "Chat history"}</h2>
            <button className="icon-button" type="button" aria-label="Close panel" onClick={() => setPanel(null)}><X size={18} /></button>
          </div>
          {panel === "profile" ? (
            <div className="profile-details">
              <strong>{user?.displayName}</strong>
              <p>Local prototype workspace</p>
              <button className="profile-signout" type="button" onClick={signOut}><LogOut size={17} /> Sign out</button>
            </div>
          ) : (
            <>
              <label className="sr-only" htmlFor="chat-search">Search conversations</label>
              <input id="chat-search" className="chat-search" placeholder="Search conversations" value={search} onChange={(event) => setSearch(event.target.value)} />
              <div className="conversation-list">
                {conversations.length ? conversations.map((conversation) => (
                  <button className={`conversation-link ${workspace.activeConversationId === conversation.id ? "selected" : ""}`} key={conversation.id} type="button" onClick={() => { selectConversation(conversation.id); setPanel(null); }}>
                    <MessageCircle size={16} /><span>{conversation.title}</span>
                  </button>
                )) : <p className="empty-sidebar-copy">{search ? "No chats match your search." : "Your conversations will appear here."}</p>}
              </div>
            </>
          )}
        </section>
      )}
    </aside>
  );
}
