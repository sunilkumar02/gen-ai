# AI Assist workspace

A frontend-only starting point for a personal AI assistant, built with Next.js, React, TypeScript, and Zustand. The first screen signs in through the separate backend; after entering the workspace, you can start and revisit conversations.

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

## Login and local persistence

- Login posts `{ "username": "…", "password": "<UTF-8 Base64>" }` to `/auth/login`. Only a successful response with valid user details opens chat. A 403 keeps the login screen open with an error.
- The returned `id`, `email`, `name`, `created_at`, and `updated_at` are stored in Zustand memory for the current session. No password or encoded password is persisted. Reloading requires signing in again because no session-validation endpoint or token contract has been provided.
- Conversations remain in this browser's `localStorage`, partitioned by the backend user ID. They do not sync across devices. Old prototype histories are retained under their old keys but are not assigned to API users based on a typed username.
- Light and dark themes are available on login and in the chat header. The initial theme follows the system preference; a manual choice is saved in this browser.
- Assistant replies are illustrative placeholders from `src/lib/chat/mock-assistant.ts`; they are not AI-generated.
- The sidebar provides new chat, history, and profile controls. The separate chat prompt component contains a textarea and an always-visible send button, with Enter to send and Shift+Enter for a newline.

The backend validates login credentials. The frontend screen gate and browser history partitioning are not authorization boundaries; backend requests must enforce access. Base64 is encoding, not encryption. Use HTTPS outside local development.

## Backend integration

Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` in `.env.local` (without `/api`). Restart the dev server after changing it. The backend must allow CORS requests from the frontend origin, typically `http://localhost:3000`. The typed `apiRequest<T>()` helper in `src/lib/api/client.ts` centralizes JSON requests and raises `ApiError` for network, HTTP, and invalid-response errors. Add feature-specific API modules under `src/lib/api/` when the endpoint and payload contracts are defined.

## Quality checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

See the [documentation index](./docs/README.md) for architecture and backend-integration notes.
