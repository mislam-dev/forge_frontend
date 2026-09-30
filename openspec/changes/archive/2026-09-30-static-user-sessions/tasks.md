# Tasks

## 1. Hook & Mock Data Refactoring

- [x] 1.1 Update `useActiveSessions` in `src/lib/hooks/api/useUserProfile.ts` to return static mock session data conforming to `UserSessionDTO` without calling `GET /api/v1/users/me/sessions`; verify with `npx tsc --noEmit`.
- [x] 1.2 Update `useRevokeSession` in `src/lib/hooks/api/useUserProfile.ts` to mutate local query cache or simulate revocation without dispatching `DELETE /api/v1/users/me/sessions/:sessionId`; verify with `npx tsc --noEmit`.

## 2. UI Enhancements

- [x] 2.1 Add a "Static" badge to the "Active Sessions & Devices" section header in `src/app/(dashboard)/settings/security/page.tsx`; verify markup and styling.
- [x] 2.2 Ensure `src/app/(dashboard)/settings/page.tsx` gracefully consumes static session data for its security card badge and device count summary; verify by checking rendered badge text.

## 3. Verification

- [x] 3.1 Run TypeScript compiler and ESLint to verify that no typing or lint errors are introduced across settings pages and hooks.
