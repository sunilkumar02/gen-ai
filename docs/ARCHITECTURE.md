# Architecture

## Scope

AI Assist is a frontend-only Next.js App Router application. The backend is separate. Login is connected to `POST /auth/login`; chat responses remain local illustrative placeholders. The frontend login gate is not a server-side authorization boundary.

## Source layout

```text
src/
  app/                  Routes, root layout, metadata, global styles
  components/           Small UI primitives shared across features
  features/
    auth/components/    Login screen
    chat/components/    Chat workspace, prompt, and sidebar
  lib/
    api/                Shared API configuration, request client, feature API modules
    chat/               Chat-specific helpers, currently a mock assistant response
  stores/               Zustand state and persistence
  types/                Shared domain types
```

Keep UI close to its feature. Components should render state and send user actions to the store or feature service; shared behavior belongs in `src/lib/`, and cross-feature state belongs in Zustand stores.

## State and persistence

`src/stores/chat-store.ts` owns the current backend user profile, login loading state, conversations, and hydration status. Its async `signIn` action calls `loginUser` in `src/lib/api/auth.ts` and updates the user only after the response passes runtime validation. Login errors remain on the login screen. The profile retains the backend's `id`, `email`, `name`, `created_at`, and `updated_at`, plus UI display-name and submitted-username fields.

Conversations and the current API user profile are persisted in browser `localStorage` under `aster-chat-workspace`. Conversations are partitioned using `user:<backend-id>` keys. Reloading validates the saved profile shape, copies only documented fields and the submitted username, and restores the local chat UI. This is not a server-verified session; no session-validation endpoint or token contract has been specified. Passwords, encoded passwords, tokens, and undocumented response fields are never persisted. Signing out clears the current user, removes the saved profile from the persisted object, and invalidates pending login results. Conversation history and theme preference remain. Storage write failures are shown visibly, including when saved details could not be removed.

Persistence version 3 migrates older storage by retaining history and discarding older saved profiles, so an old local login cannot bypass the API. The original storage key and old histories remain, but username-keyed histories are not attached to backend identities. Client-side partitioning is not authorization, encryption, or cross-device persistence.

`src/stores/theme-store.ts` owns the light/dark preference. `ThemeProvider` initializes it from browser storage, falling back to the system preference. A shared `ThemeToggle` is available on login and in the chat header. CSS theme variables and `light-dark()` colors style both screens and native controls. Storage failures are shown beside the toggle, and the selected theme still applies for the current session.

## Theme colors

`src/app/palette.css` exposes the complete supplied raw palette as CSS custom properties for non-theme design tooling. Product styles in `src/app/globals.css` use semantic tokens with palette literals through `light-dark()`; they do not consume raw palette variables. Changing the root `color-scheme` switches all semantic roles, including native controls, and the system preference is used until the saved theme initializes.

Light mode uses white workspace surfaces, light page neutrals, strong dark text, and brand blue03 actions. Dark mode uses dark06 workspace surfaces, dark05 panels, dark04 composer surfaces, strong light text, and brand blue01 actions. Button foregrounds, focus indicators, avatars, shadows, and error states also use semantic palette roles. Error text uses a readable neutral in light mode and the light error color in dark mode.

## Chat behavior

The chat UI in `src/features/chat/components/` reads and updates the store. Assistant messages currently come from `src/lib/chat/mock-assistant.ts` and are explicitly illustrative. Keep this boundary when replacing the mock with a backend-backed chat service.

The chat layout uses a narrow icon rail and a rounded composer, with a theme toggle in the header. The sidebar includes new chat, chat history, and profile controls. The history button opens a dismissible conversation panel with a search field; the profile button exposes sign-out. The empty state centers the welcome heading and composer; conversations scroll above the composer after sending. Both themes use neutral surfaces, with the supplied near-black `#131517` workspace in dark mode.

`ChatPrompt` in `src/features/chat/components/chat-prompt.tsx` is a controlled presentational component containing the textarea and always-visible send button. `ChatWorkspace` owns the draft, message submission, and errors. The textarea grows with newlines and wrapped text up to six lines, then scrolls internally. It shrinks when text is removed or sent, and recalculates wrapping when its width changes. The prompt submits with Enter or the send button, supports Shift+Enter for newlines and IME composition, and disables sending empty or whitespace-only drafts. The Chat/Work tabs, attachment plus icon, voice controls, Instant label, and starter suggestion are removed.

## Errors and environment

Show actionable failures to users rather than hiding request or storage errors. Use the shared `ApiError` type for API failures. Keep browser-safe configuration in environment variables with the `NEXT_PUBLIC_` prefix; never include private credentials in client-side environment variables.

## Extending the product

- Add a feature under `src/features/` when it has its own UI and behavior.
- Promote a UI primitive to `src/components/` only when it is shared.
- Keep API transport in `src/lib/api/`, with feature-specific typed functions separate from React components.
- Add or update shared contracts in `src/types/` when backend schemas become available.
- Update this document and [Backend integration](./BACKEND-INTEGRATION.md) when these boundaries or behaviors change.
