# Tasks

## 1. Type Definitions & Validation

- [x] 1.1 Define `AddTeamMemberDTO` in `src/lib/api/types.ts` requiring `user_id: string` and `role: string`, and alias `AddTeamMemberRequest` to it.
- [x] 1.2 Update `addTeamMemberSchema` in `src/lib/validation/teams.ts` to validate `{ user_id: string, role: string }` with UUID validation.
- [x] 1.3 Update `useAddTeamMember` in `src/lib/hooks/api/useTeams.ts` to dispatch `{ user_id, role }` strictly conforming to `AddTeamMemberDTO`.

## 2. Team Member Assignment UI

- [x] 2.1 Update the "Add New Member" form in `src/components/teams/TeamMembersManager.tsx` to support selecting available organization members or entering a user UUID.
- [x] 2.2 Wire form submission to pass `{ user_id, role }` to `useAddTeamMember` and verify inline validation feedback.

## 3. Verification & Build

- [x] 3.1 Run `pnpm tsc --noEmit` to verify zero type errors across hooks, schemas, and components.
- [x] 3.2 Run `pnpm build` to verify clean production compilation.
