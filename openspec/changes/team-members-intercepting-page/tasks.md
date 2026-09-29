# Tasks

## 1. Hooks & Component Refactoring

- [x] 1.1 Implement `useTeamDetail` hook in `src/lib/hooks/api/useTeams.ts` to fetch `GET /api/v1/teams/:id`.
- [x] 1.2 Refactor team member roster UI into a reusable `TeamMembersManager` component in `src/components/teams/TeamMembersManager.tsx` supporting modal and standalone page contexts.
- [x] 1.3 Update `TeamMembersDialog.tsx` to wrap `TeamMembersManager` for backward compatibility.

## 2. Dedicated & Intercepting Routes

- [x] 2.1 Create parallel intercepted route at `src/app/(dashboard)/@modal/(.)teams/[id]/members/page.tsx` rendering `TeamMembersManager` inside a modal dialog with `router.back()` on dismissal.
- [x] 2.2 Create dedicated standalone page at `src/app/(dashboard)/teams/[id]/members/page.tsx` with back navigation, team header, and `TeamMembersManager`.
- [x] 2.3 Update team card buttons in `src/app/(dashboard)/teams/page.tsx` and `src/app/(dashboard)/organizations/[id]/teams/page.tsx` to link to `/teams/${team.id}/members`.

## 3. Verification & Build

- [x] 3.1 Run `pnpm tsc --noEmit` to verify zero type errors.
- [x] 3.2 Run `pnpm build` to verify clean compilation of new dynamic and parallel routes.
