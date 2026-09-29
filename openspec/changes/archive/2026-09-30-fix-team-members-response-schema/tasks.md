# Tasks

## 1. Type Definitions & API Hooks

- [x] 1.1 Relax `TeamMemberDTO` in `src/lib/api/types.ts` by making `id`, `name`, and `email` optional while ensuring `team_id`, `user_id`, `role`, and `joined_at` are required, and verify typing.
- [x] 1.2 Ensure `useRemoveTeamMember` and `useUpdateTeamMemberRole` in `src/lib/hooks/api/useTeams.ts` smoothly handle identifiers passed as either `id` or `user_id`.

## 2. TeamMembersDialog Component Defensiveness

- [x] 2.1 Implement defensive rendering in `src/components/teams/TeamMembersDialog.tsx` so avatar initials, display names, and emails never throw `TypeError: Cannot read properties of undefined (reading 'slice')`.
- [x] 2.2 Integrate optional member enrichment via `useOrgMembers` in `src/components/teams/TeamMembersDialog.tsx` to resolve user names and emails when within an active organization workspace.
- [x] 2.3 Normalize role options and badge styling in `src/components/teams/TeamMembersDialog.tsx` to support backend roles (such as `admin`, `member`, `developer`, `viewer`), and use `member.id || member.user_id` for actions.

## 3. Verification & Build

- [x] 3.1 Run `pnpm tsc --noEmit` to verify zero type errors.
- [x] 3.2 Run `pnpm build` to verify a clean Next.js production build.
