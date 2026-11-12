"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  CircleHelp,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { useChatStore } from "@/stores/chat-store";

export function LoginScreen() {
  const signIn = useChatStore((state) => state.signIn);
  const storageError = useChatStore((state) => state.storageError);
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const formData = new FormData(event.currentTarget);
    const displayName = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    if (!displayName || !email) {
      setFormError("Add your name and email address to continue.");
      return;
    }

    try {
      signIn(displayName, email);
    } catch {
      setFormError("We couldn't open your workspace. Please try again.");
    }
  }

  return (
    <main className="login-page">
      <section className="login-story" aria-label="About Aster">
        <div className="login-story-top">
          <Link className="brand-lockup" href="/" aria-label="Aster home">
            <BrandMark size={17} />
            <span>aster</span>
          </Link>
          <span className="story-edition">PERSONAL AI WORKSPACE</span>
        </div>

        <div className="story-copy">
          <span className="eyebrow"><span className="status-dot" /> A calmer way to get things done</span>
          <h1>Make room<br />for your <em>best thinking.</em></h1>
          <p>
            A thoughtful AI companion for the ideas, questions, and work that
            matter to you.
          </p>
          <div className="story-note">
            <span className="note-icon"><Sparkles size={16} /></span>
            <span>One space for everything on your mind.</span>
            <ArrowUpRight size={16} />
          </div>
        </div>

        <div className="story-footer">
          <span>Designed for your next big idea.</span>
          <span className="story-avatars" aria-hidden="true">
            <i>J</i><i>M</i><i>A</i><span>+2k</span>
          </span>
        </div>
        <div className="decor-orbit decor-orbit-one" />
        <div className="decor-orbit decor-orbit-two" />
        <div className="decor-star decor-star-one">✳</div>
        <div className="decor-star decor-star-two">✦</div>
      </section>

      <section className="login-panel">
        <div className="login-panel-top">
          <span className="login-panel-caption">YOUR PERSONAL SPACE</span>
          <a href="mailto:hello@example.com" className="help-link">
            <CircleHelp size={15} /> Need help?
          </a>
        </div>

        <div className="login-form-wrap">
          <span className="form-icon"><Sparkles size={20} /></span>
          <span className="eyebrow form-eyebrow">WELCOME TO ASTER</span>
          <h2>Start with a hello.</h2>
          <p className="form-intro">Sign in to pick up where your curiosity left off.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="name">Your name</label>
            <input id="name" name="name" autoComplete="name" placeholder="How should we call you?" required />
            <label htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
              <LockKeyhole size={15} aria-hidden="true" />
            </div>

            {formError && <p className="form-error" role="alert">{formError}</p>}
            {storageError && <p className="form-error" role="alert">{storageError}</p>}

            <button type="submit" className="primary-button login-submit">
              Continue to your space <ArrowUpRight size={16} />
            </button>
          </form>

          <p className="privacy-note"><LockKeyhole size={13} /> Your chats stay in this browser in this prototype.</p>
          <div className="login-benefits">
            <span><Check size={14} /> Personal by design</span>
            <span><Check size={14} /> Ready when you are</span>
          </div>
          <p className="prototype-note">
            Prototype sign-in only. Authentication will be connected to your backend later.
          </p>
        </div>
        <footer className="login-footer">
          <span>© 2026 Aster AI</span>
          <span>Thoughtful technology, for you.</span>
        </footer>
      </section>
    </main>
  );
}
