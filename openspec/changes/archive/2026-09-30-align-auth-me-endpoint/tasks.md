# Tasks

## 1. Type Definitions & API Client Hook

- [x] 1.1 Add `MeResponseDto` and `MeResponseDTO` interface in `src/lib/api/types.ts` with `id: string`, `name: string`, and `email: string`, and verify via `pnpm tsc --noEmit`
- [x] 1.2 Update `src/lib/hooks/api/useUserProfile.ts` to query `/api/v1/auth/me`, parse both envelope-wrapped and direct responses, and expose `useCurrentUser` alongside `useUserProfile`
- [x] 1.3 Add synchronization of user identity into `localStorage` (`forge_user_profile`) upon successful query resolution in `useUserProfile.ts`

## 2. Component Integration

- [x] 2.1 Update `src/components/layout/Sidebar.tsx` to extract display name and email directly from `MeResponseDto` and verify personal profile label displays correctly
- [x] 2.2 Update `src/components/layout/UserNav.tsx` to integrate with `useUserProfile`/`useCurrentUser` for avatar initials and email
- [x] 2.3 Update `src/app/(dashboard)/settings/page.tsx` and `src/app/(dashboard)/settings/profile/page.tsx` to consume user name and email from `MeResponseDto`

## 3. Verification & Build

- [x] 3.1 Verify no unintended references to `/api/v1/users/me` remain in `src/` using `git grep "users/me" src/`
- [x] 3.2 Run build and type checking (`pnpm build` or `pnpm tsc --noEmit`) to verify zero TypeScript or lint errors
