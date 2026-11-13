# Backend integration

## Configuration

Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` in `.env.local`, without `/api`. The local `.env.local` is configured for this backend. Without configuration the shared API client uses relative `/api` requests; no same-origin login route is implemented. Restart the development server after changing environment values. Only browser-safe values belong in `NEXT_PUBLIC_*` variables.

The backend must accept cross-origin JSON POST requests and preflight requests from the frontend origin (usually `http://localhost:3000`). CORS configuration belongs to the backend; the frontend does not bypass it. Use HTTPS outside local development: Base64 is reversible encoding, not encryption.

## Login contract

`src/lib/api/auth.ts` implements `loginUser(username, password)` using the shared API client. It trims the username, preserves password bytes, encodes the password as UTF-8 Base64, and sends:

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "username": "sample-user",
  "password": "<UTF-8 Base64 encoded password>"
}
```

The payload keys are `username` and `password`. A successful response is a top-level user object:

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "sample@example.com",
  "name": "Sample User",
  "created_at": "2026-11-13T10:22:47.402Z",
  "updated_at": "2026-11-13T10:22:47.402Z"
}
```

The API module validates all five nonempty string fields and timestamps at runtime, copies only documented fields, and rejects invalid JSON, malformed success objects, and empty responses. HTTP 403 (and 401) displays a credential error. Network/CORS failures and other server failures display actionable errors. The form disables duplicate submissions while loading.

The chat store holds returned user details in memory and opens chat only after successful validation. It does not persist passwords, Base64 passwords, user details, or tokens. Only conversation history is stored locally, partitioned by backend user ID. Old prototype sessions cannot restore access. Reloading requires login again because the supplied contract has no session-check, logout, refresh, cookie, or token behavior. Backend authorization must protect any future authenticated API endpoints.

## Request boundary

Keep requests behind `apiRequest<T>()` in `src/lib/api/client.ts`. It centralizes JSON transport and raises `ApiError` for network, HTTP, and invalid JSON failures. Feature API modules validate their own payload contracts and keep transport out of UI components. Shared auth contracts live in `src/types/auth.ts`.

## Remaining integration

- Confirm session lifecycle, token/cookie handling, expiration, server-side logout, and a session-validation endpoint before restoring logins across reloads.
- Define the chat endpoint, streaming behavior, and server-authorized conversation ownership before replacing `src/lib/chat/mock-assistant.ts`.
- Decide whether history should stay browser-local or move to the backend, and migrate local histories deliberately.
- Run `npm test` for mocked login success, Unicode encoding, failures, malformed responses, session gating, and per-user history checks. Live verification needs a running backend and valid test credentials.
