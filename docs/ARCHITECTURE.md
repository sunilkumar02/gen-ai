# Architecture

## Scope

Aster is a frontend-only Next.js App Router application. The backend is separate and its endpoint and payload contracts have not been defined yet. The login and assistant response are local prototypes, not production authentication or AI inference.

## Source layout

```text
src/
  app/                  Routes, root layout, metadata, global styles
  components/           Small UI primitives shared across features
  features/
    auth/components/    Login screen
    chat/components/    Chat workspace and sidebar
  lib/
    api/                Shared API configuration, request client, feature API modules
    chat/               Chat-specific helpers, currently a mock assistant response
  stores/               Zustand state and persistence
  types/                Shared domain types
```

Keep UI close to its feature. Components should render state and send user actions to the store or feature service; shared behavior belongs in `src/lib/`, and cross-feature state belongs in Zustand stores.

## State and persistence

`src/stores/chat-store.ts` owns the current prototype user, conversations, selected conversation, and hydration status. Zustand persistence currently stores the user profile and workspaces in browser `localStorage`; a normalized email is only a local workspace key. This is not authorization, encryption, or cross-device persistence.

The password field exists only to complete the prototype form. Passwords are not stored or sent to a service. Replace this behavior with backend authentication and server-authorized user identity before using real accounts or private data.

## Chat behavior

The chat UI in `src/features/chat/components/` reads and updates the store. Assistant messages currently come from `src/lib/chat/mock-assistant.ts` and are explicitly illustrative. Keep this boundary when replacing the mock with a backend-backed chat service.

## Errors and environment

Show actionable failures to users rather than hiding request or storage errors. Use the shared `ApiError` type for API failures. Keep browser-safe configuration in environment variables with the `NEXT_PUBLIC_` prefix; never include private credentials in client-side environment variables.

## Extending the product

- Add a feature under `src/features/` when it has its own UI and behavior.
- Promote a UI primitive to `src/components/` only when it is shared.
- Keep API transport in `src/lib/api/`, with feature-specific typed functions separate from React components.
- Add or update shared contracts in `src/types/` when backend schemas become available.
- Update this document and [Backend integration](./BACKEND-INTEGRATION.md) when these boundaries or behaviors change.
