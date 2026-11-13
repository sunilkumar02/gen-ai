"use client";

import { useLayoutEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

type ChatPromptProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (content: string) => void;
};

export function ChatPrompt({ value, onChange, onSubmit }: ChatPromptProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    function resize() {
      if (!textarea) return;
      const styles = window.getComputedStyle(textarea);
      const maxHeight = Number.parseFloat(styles.maxHeight);
      const minHeight = Number.parseFloat(styles.minHeight);
      // Reset first so deleting text and clearing a sent draft also shrink it.
      textarea.style.height = "0px";
      const contentHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.max(minHeight, Math.min(contentHeight, maxHeight))}px`;
      textarea.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden";
    }

    resize();
    let previousWidth = textarea.getBoundingClientRect().width;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width !== previousWidth) {
        previousWidth = entry.contentRect.width;
        resize();
      }
    });
    observer.observe(textarea);
    return () => observer.disconnect();
  }, [value]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (value.trim()) onSubmit(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (value.trim()) onSubmit(value);
    }
  }

  return (
    <div className="composer-area">
      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          aria-label="Message AI Assist"
          placeholder="Ask AI Assist"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button className="send-button" type="submit" aria-label="Send message" title="Send message" disabled={!value.trim()}>
          <ArrowUp size={22} />
        </button>
      </form>
    </div>
  );
}
