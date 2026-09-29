# Proposal

## Why

Navigating to `/projects/[id]/access` crashes with `TypeError: Cannot read properties of undefined (reading 'toLowerCase')` when teams are assigned to a project. The backend endpoint `GET /api/v1/projects/:id/teams` returns assigned team records with nested `team` objects (`{ project_id, team_id, assigned_at, team: { id, name, ... } }`) and without an explicit `role` property. The current frontend access page directly accesses `team.name` and calls `role.toLowerCase()` without null-safety guards. Additionally, `POST /projects/:id/teams` should strictly conform to the OpenAPI 3.0 specification which expects `{ team_id: string }`.

## What Changes

- Update `ProjectTeamDTO` in `src/lib/api/types.ts` to accurately model the backend response schema: optional `id`, optional `name`, optional `role`, `assigned_at`, and nested `team` object (`{ id, name, organization_id, descriptions, created_at, updated_at }`).
- Make `AssignProjectTeamRequest` in `src/lib/api/types.ts` conform to OpenAPI specification (`{ team_id: string; role?: string }`), ensuring required `team_id` is sent.
- Add null-safety to `getRoleBadgeVariant` in `src/app/(dashboard)/projects/[id]/access/page.tsx` so undefined or null roles safely fall back to a default variant (e.g. `'secondary'` or `'outline'`) without throwing runtime errors.
- Update `renderTeamsTable` in `src/app/(dashboard)/projects/[id]/access/page.tsx` to safely resolve team display name (`team.team?.name || team.name || team.team_id`), assignment timestamp (`team.assigned_at || team.team?.created_at || team.created_at`), and fallback role display (`team.role || 'Assigned'`).
- Ensure team removal action passes the correct team identifier (`team.team_id || team.team?.id || team.id`).

## Capabilities

### Modified Capabilities
- `domain-modules`: Update requirement 6 for `/projects/[id]/access` to safely render assigned project teams handling nested `team` records (`team.name`, `assigned_at`), null-safe role badges, and aligning `POST /api/v1/projects/:id/teams` payload with OpenAPI.

## Impact

- `src/lib/api/types.ts`: `ProjectTeamDTO` and `AssignProjectTeamRequest` type definitions.
- `src/app/(dashboard)/projects/[id]/access/page.tsx`: Project access UI, team access table rendering, role badge helper, and team revocation handler.
- Prevents Dashboard error boundary crashes on the project access page.
