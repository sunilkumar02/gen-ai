# Aster AI workspace

A frontend-only starting point for a personal AI assistant, built with Next.js, React, TypeScript, and Zustand. The first screen is a local prototype login; after entering the workspace, you can start and revisit conversations.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```text
src/
  app/                  Next.js routes, layout, and global styles
  components/           Small shared UI primitives
  features/
    auth/components/    Login experience
    chat/components/    Workspace, navigation, and chat UI
  lib/
    api/                Shared typed API request client and configuration
    chat/               Frontend-only assistant response
  stores/               Zustand workspace state and persistence
  types/                Shared domain types
```

UI components are kept under `features`; workspace behavior and browser persistence live in the Zustand store; the API client is independent of the UI so backend endpoints can be added without coupling request logic to components.

## Prototype behavior and persistence

- Login is a UI placeholder. It does not authenticate, validate a password, or contact a server. Passwords are never stored.
- The signed-in email is used as a local workspace key. Conversations and the current user are persisted in this browser's `localStorage`, so they are not synced across devices and can be cleared by the user.
- Assistant replies are illustrative placeholders from `src/lib/chat/mock-assistant.ts`; they are not AI-generated.
- Agent discovery, integrations, attachments, and voice input are intentionally marked as coming soon.

Do not treat this local prototype as an authentication or data-security boundary. Replace it with backend authentication and server-side authorization before handling real user data.

## Backend integration

Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to the backend API base URL. The typed `apiRequest<T>()` helper in `src/lib/api/client.ts` centralizes JSON requests and raises `ApiError` for network, HTTP, and invalid-response errors. Add feature-specific API modules under `src/lib/api/` when the endpoint and payload contracts are defined.

## Quality checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

See the [documentation index](./docs/README.md) for architecture and backend-integration notes.
