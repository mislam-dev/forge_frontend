# Tasks

## 1. DTO & API Type Alignments

- [x] 1.1 Update `ProjectTeamDTO` in `src/lib/api/types.ts` to include `assigned_at?: string`, nested `team?: TeamDTO | { id: string; organization_id?: string; name: string; descriptions?: string | null; created_at?: string; updated_at?: string }`, optional `name?: string`, optional `role?: string`, and optional `id?: string`, and verify TypeScript compilation passes.
- [x] 1.2 Update `AssignProjectTeamRequest` in `src/lib/api/types.ts` to make `role?: string` optional while requiring `team_id: string` in alignment with the OpenAPI 3.0 specification.
- [x] 1.3 Update `useAssignProjectTeam` in `src/lib/hooks/api/useProjectAccess.ts` to dispatch `{ team_id: payload.team_id }` to `/api/v1/projects/:id/teams` matching the OpenAPI contract.

## 2. Project Access UI & Resilience Updates

- [x] 2.1 Update `getRoleBadgeVariant` in `src/app/(dashboard)/projects/[id]/access/page.tsx` with a null/undefined guard to safely return a fallback variant when `role` is undefined.
- [x] 2.2 Update `renderTeamsTable` in `src/app/(dashboard)/projects/[id]/access/page.tsx` to safely resolve team display name (`team.team?.name || team.name || team.team_id`), assignment timestamp (`team.assigned_at || team.team?.created_at || team.created_at`), fallback role badge (`team.role || 'Assigned'`), and revocation ID (`team.team_id || team.team?.id || team.id`).

## 3. Verification & Build

- [x] 3.1 Run TypeScript type check (`pnpm tsc --noEmit`) and verify clean compilation without errors.
- [x] 3.2 Run production build (`pnpm build`) and verify all pages build successfully.
