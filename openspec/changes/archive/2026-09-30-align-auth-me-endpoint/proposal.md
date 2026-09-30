# Proposal

## Why
The frontend currently references `/api/v1/users/me` to fetch current user profile information. However, the backend Axum API serves the currently logged-in user identity at `GET /api/v1/auth/me`, returning a `MeResponseDto` containing `id`, `name`, and `email`. Aligning the frontend with the correct endpoint and response schema resolves API 404/failure errors and ensures authenticated user data displays accurately across the navigation shell and settings.

## What Changes
- Add `MeResponseDto` interface in `src/lib/api/types.ts` representing the backend DTO (`id: string`, `name: string`, `email: string`).
- Update API transport and client hooks to fetch current user identity from `GET /api/v1/auth/me` instead of `/api/v1/users/me`.
- Update `useUserProfile` / provide `useCurrentUser` hook to consume `GET /api/v1/auth/me` and support both envelope-wrapped (`ApiResponse<MeResponseDto>`) and direct payload structures.
- Update layout components (`Sidebar`, `UserNav`) and settings pages to consume the authenticated user's `name` and `email` from the new hook/endpoint.
- Update documentation and mock definitions if applicable.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `auth-routing`: Add requirement and scenarios for retrieving the currently authenticated user identity via `GET /api/v1/auth/me` returning `MeResponseDto`.
- `api-transport`: Extend typed domain DTO requirements with `MeResponseDto` (`id: UUID`, `name: string`, `email: string`).

## Impact
- **APIs**: Replaces requests to `/api/v1/users/me` with `GET /api/v1/auth/me`.
- **TypeScript Types**: Adds `MeResponseDto` and updates user identity query return types.
- **Components & Hooks**: `useUserProfile.ts` (or `useAuth.ts`), `Sidebar.tsx`, `UserNav.tsx`, and `app/(dashboard)/settings/*`.
