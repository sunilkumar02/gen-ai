# Project Guidelines

## Project scope

- This repository is the frontend for Aster, built with Next.js App Router, React, TypeScript, and Zustand. The backend is developed separately.
- Treat login and assistant replies as prototype-only. Never describe local storage or the prototype login as secure authentication or server-side persistence.

## Architecture

- Keep route composition in `src/app/`, shared UI primitives in `src/components/`, and product UI in `src/features/<feature>/components/`.
- Keep state and business rules out of presentational components. Use `src/stores/` for shared Zustand state, `src/lib/` for reusable logic and API modules, and `src/types/` for shared domain contracts.
- Put backend requests behind `src/lib/api/`. Do not call `fetch` directly from UI components; add typed feature API functions when endpoint schemas are provided.
- Keep environment-specific values in environment variables. Only expose values safe for the browser with the `NEXT_PUBLIC_` prefix; never put secrets in frontend configuration.
- Reuse existing components and patterns before adding new abstractions. Use clear, feature-oriented names and remove code made redundant by a change.

## Reliability and UX

- Handle request, browser-storage, and user-input failures visibly. Do not silently hide errors or return success-shaped fallbacks.
- Keep UI accessible: use semantic elements, associated form labels, keyboard support, and visible focus states.
- Preserve per-user data boundaries in client state, but do not treat client-side partitioning as authorization or security.

## Documentation

- Keep durable project documentation in `docs/`. Update it when architecture, user-visible behavior, API integration, or setup changes.
- Start at [docs/README.md](./docs/README.md); avoid duplicating those details in this file.

## Build and validation

- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` for application code changes when practical.
- Use `npm run dev` for local development. See [README.md](./README.md) for setup.
