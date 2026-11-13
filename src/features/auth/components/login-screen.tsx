"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { useChatStore } from "@/stores/chat-store";

export function LoginScreen() {
  const signIn = useChatStore((state) => state.signIn);
  const isSigningIn = useChatStore((state) => state.isSigningIn);
  const storageError = useChatStore((state) => state.storageError);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSigningIn) return;
    setFormError(null);
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!username || !password.trim()) {
      setFormError("Enter your username and password to continue.");
      return;
    }

    try {
      await signIn(username, password);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "We couldn't sign you in. Please try again.");
    }
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <Link className="brand-lockup" href="/" aria-label="AI Assist home">
          <BrandMark size={18} /> AI Assist
        </Link>
        <ThemeToggle />
      </header>
      <section className="login-card" aria-labelledby="login-title">
        <BrandMark size={24} />
        <h1 id="login-title">Welcome to AI Assist</h1>
        <p className="form-intro">Sign in to your personal workspace.</p>
        <form onSubmit={handleSubmit} className="login-form" aria-describedby="login-note" aria-busy={isSigningIn}>
          <label htmlFor="username">Username</label>
          <input id="username" name="username" autoComplete="username" placeholder="Enter your username" disabled={isSigningIn} required />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" disabled={isSigningIn} required />
          {formError && <p className="form-error" role="alert">{formError}</p>}
          {storageError && <p className="form-error" role="alert">{storageError}</p>}
          <button type="submit" className="primary-button" disabled={isSigningIn}>{isSigningIn ? "Signing in…" : "Sign in"} <ArrowRight size={16} /></button>
        </form>
        <p className="prototype-note" id="login-note">
          Sign in with your backend account. Chats stay in this browser.
        </p>
      </section>
      <footer className="login-footer">AI Assist · Your space to think and create</footer>
    </main>
  );
}
