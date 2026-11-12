# Backend integration

The frontend is intentionally ready for API integration, but no backend endpoint or payload contract is assumed. Confirm the schema and authentication approach with the backend before implementing feature requests.

## Configuration

Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to the backend API base URL. `.env.example` contains a local example. Only use `NEXT_PUBLIC_` for values that are safe to expose to every browser user; secrets and privileged credentials must remain on the backend.

## Request boundary

Use `apiRequest<T>()` from `src/lib/api/client.ts` for JSON requests. It centralizes URL construction and raises `ApiError` for network failures, non-success HTTP responses, and invalid JSON responses. Add feature-specific modules under `src/lib/api/` when contracts are known, for example an auth service or chat service. UI components should call those modules through feature logic rather than construct requests directly.

The generic response type is compile-time guidance, not runtime schema validation. Add runtime validation when contracts and the project's validation approach are agreed.

## Integration checklist

1. Define endpoint paths, request/response types, error formats, and pagination/streaming behavior with the backend.
2. Replace prototype login with the agreed authentication flow. Do not trust a client-provided email as user identity.
3. Decide how credentials or tokens are issued, stored, refreshed, and revoked. Do not place secrets in `NEXT_PUBLIC_*` variables or persist sensitive credentials in Zustand/localStorage without an explicit security design.
4. Add typed feature API functions under `src/lib/api/` and keep transport concerns out of React components.
5. Replace the local mock assistant response with the backend chat flow. Preserve loading, retry, and visible error states; account for cancellation and streaming if supported.
6. Decide whether the backend or local UI owns conversation history. Remove or migrate local prototype data deliberately; do not imply local storage syncs across devices.
7. Add tests for successful responses, API errors, unauthorized access, and malformed payloads.
8. Update this document and [Architecture](./ARCHITECTURE.md) to reflect the implemented contracts and security model.
