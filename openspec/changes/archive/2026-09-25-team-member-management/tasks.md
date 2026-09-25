# Tasks

## 1. API Types & React Query Hooks

- [x] 1.1 Add `AddTeamMemberRequest` to `src/lib/api/types.ts` and verify type compliance with `npx tsc --noEmit`
- [x] 1.2 Implement `useTeamMembers`, `useAddTeamMember`, and `useRemoveTeamMember` in `src/lib/hooks/api/useTeams.ts` with cache invalidation for both members and team list

## 2. Mock Data Provider & Endpoints

- [x] 2.1 Add seed team members in `src/lib/api/mock/seeds.ts` for all default teams
- [x] 2.2 Implement mock handlers for `GET /api/v1/teams/:id/members`, `POST /api/v1/teams/:id/members`, and `DELETE /api/v1/teams/:id/members/:memberId` in `src/lib/api/mock/adapter.ts`

## 3. UI Component & Page Integration

- [x] 3.1 Implement `src/components/teams/TeamMembersDialog.tsx` with member roster list, role badges, add member form, and remove confirmation
- [x] 3.2 Wire `TeamMembersDialog` into the global teams cards in `src/app/(dashboard)/teams/page.tsx`
- [x] 3.3 Wire `TeamMembersDialog` into the organization teams cards in `src/app/(dashboard)/organizations/[id]/teams/page.tsx`

## 4. Verification & Build

- [x] 4.1 Run TypeScript verification with `npx tsc --noEmit` and verify zero errors
- [x] 4.2 Run Next.js production build with `pnpm exec next build --webpack` and verify build passes cleanly
