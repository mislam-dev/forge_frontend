# Design

## Context
The frontend was previously invoking `/api/v1/users/me` to retrieve profile information, expecting an extended `UserProfileDTO` structure. The backend Axum service actually serves current authenticated user identity from `GET /api/v1/auth/me` returning `MeResponseDto` with fields `id` (UUID), `name` (String), and `email` (String). See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Add `MeResponseDto` (and alias `MeResponseDTO`) in `src/lib/api/types.ts` conforming strictly to the Axum backend definition.
- Update/add query hook (`useCurrentUser` / `useUserProfile`) to fetch from `GET /api/v1/auth/me`.
- Ensure robust parsing of response envelopes whether returned as raw `MeResponseDto` or wrapped in `ApiResponse<MeResponseDto>`.
- Update consuming UI components (`Sidebar.tsx`, `UserNav.tsx`, `settings/page.tsx`, `settings/profile/page.tsx`) to utilize `MeResponseDto`.
- Synchronize retrieved user identity (`id`, `name`, `email`) into `localStorage` (`forge_user_profile`) for instant display across the dashboard shell.

**Non-Goals:**
- Changing backend Axum handlers or routes.
- Refactoring unrelated endpoints such as password changes or active session management.

## Decisions

### 1. DTO Structure and Naming
Add the following to `src/lib/api/types.ts`:
```typescript
export interface MeResponseDto {
  id: string;
  name: string;
  email: string;
}
export type MeResponseDTO = MeResponseDto;
```
*Rationale*: Matches the exact Axum struct `MeResponseDto` while providing `MeResponseDTO` alias to follow frontend codebase naming conventions.

### 2. Hook and Query Key Strategy
In `src/lib/hooks/api/useUserProfile.ts` (or `useAuth.ts`):
- Introduce query key `authKeys.me = () => ['auth', 'me'] as const`.
- Update `useUserProfile` or provide `useCurrentUser` targeting `GET /api/v1/auth/me`.
- Normalize unwrapping:
  ```typescript
  const res = await apiClient.get('/api/v1/auth/me');
  const data = (res as any)?.data?.id ? (res as any).data : res;
  return data as MeResponseDto;
  ```
- On query success, update `localStorage.setItem('forge_user_profile', JSON.stringify(data))` to keep static layouts and header initials synchronized.

### 3. Component Adaptations
- **Sidebar**: Compute `personalDisplayName` directly from `me.name` when available, falling back to cached local storage.
- **UserNav**: Read active user name and email from `useCurrentUser()` in addition to initial local storage reading, updating displayed initials and email.
- **Settings Overview & Profile**: Derive full name and initials from `me.name` (e.g. splitting into first and last name when populating the profile form).

## Risks / Trade-offs

- **[Risk]** Profile form in `settings/profile/page.tsx` previously bound to separate `first_name` and `last_name` fields.
  → **Mitigation**: Split `me.name` by whitespace to populate `first_name` and `last_name` default values; combine them on submission.
- **[Risk]** Discrepancy between wrapped envelope and unwrapped Axios responses.
  → **Mitigation**: Use defensive unwrapping in the query function checking for `res.data.id` vs `res.id`.
