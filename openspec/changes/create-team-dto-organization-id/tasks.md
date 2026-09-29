# Tasks

## 1. Type Definitions & API Hooks

- [x] 1.1 Export `CreateTeamDTO` in `src/lib/api/types.ts` requiring `organization_id: string`, `name: string`, and `descriptions?: string | null`, and update `CreateTeamRequest` to alias it.
- [x] 1.2 Update `useCreateTeam` in `src/lib/hooks/api/useTeams.ts` to construct and dispatch `{ organization_id, name, descriptions }` matching `CreateTeamDTO`.
- [x] 1.3 Update `createTeamSchema` in `src/lib/validation/teams.ts` to allow team name length up to 255 characters.

## 2. Form & Pages Integration

- [x] 2.1 Update `CreateTeamForm.tsx` to resolve `organization_id` (from prop, active organization workspace, or an inline organization selector when in personal space) and submit `{ organization_id, name, descriptions }`.
- [x] 2.2 Update `src/app/(dashboard)/organizations/[id]/teams/page.tsx` to send `organization_id: orgId` and `descriptions: values.description?.trim() || null`.

## 3. Verification & Build

- [x] 3.1 Run TypeScript type checking (`pnpm tsc --noEmit`) to verify zero type errors.
- [x] 3.2 Run frontend production build (`pnpm build`) to verify clean compilation.
