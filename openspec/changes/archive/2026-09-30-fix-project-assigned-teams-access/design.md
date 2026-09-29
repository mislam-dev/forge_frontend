# Design

## Context

See `proposal.md` for background and motivation. The backend endpoint `GET /api/v1/projects/:id/teams` returns assigned team assignments matching:
```json
{
  "assigned_at": "2026-09-29T19:29:31.049681+00:00",
  "project_id": "aa3f157f-317f-4103-81fe-76152a0cb6d9",
  "team": {
    "id": "be4fd16e-71d9-4cf6-a2f8-aa4f9429d2d2",
    "name": "A team",
    "organization_id": "1b913f11-5abc-4dc8-b0a6-3aada3466472",
    "descriptions": null,
    "created_at": "2026-09-29T18:37:17.041677Z",
    "updated_at": "2026-09-29T18:37:17.041677Z"
  },
  "team_id": "be4fd16e-71d9-4cf6-a2f8-aa4f9429d2d2"
}
```
Currently, `ProjectTeamDTO` in `src/lib/api/types.ts` is strictly typed as a flat object with required `name` and `role`. In `src/app/(dashboard)/projects/[id]/access/page.tsx`, `getRoleBadgeVariant(team.role)` calls `role.toLowerCase()`, crashing the component tree when `team.role` is undefined.

## Goals / Non-Goals

**Goals:**
- Eliminate `TypeError: Cannot read properties of undefined (reading 'toLowerCase')` in `ProjectAccessPage`.
- Expand `ProjectTeamDTO` to support the nested `team` object, `assigned_at`, and optional top-level `role`/`name`.
- Safely resolve team name (`team.team?.name || team.name || team.team_id`) and assigned date in `renderTeamsTable`.
- Render a fallback role badge (`team.role || 'Assigned'`) with a safe default variant (`'secondary'`) when `role` is absent.
- Ensure `AssignProjectTeamRequest` and `useAssignProjectTeam` align with OpenAPI 3.0 specification (`POST /projects/{id}/teams`).

**Non-Goals:**
- Modifying project member collaborator management (`/api/v1/projects/:id/members`).
- Modifying the Rust Axum backend endpoints or database schemas.

## Decisions

### Decision 1: Hybrid `ProjectTeamDTO` Schema
- **Choice**: Make top-level `name`, `role`, and `id` optional, while adding `assigned_at?: string` and nested `team?: TeamDTO` (or nested `{ id, name, organization_id, descriptions, created_at, updated_at }`).
- **Rationale**: Accommodates both the live backend response structure (which nests team details) and any mock/test fixtures that might provide flat representations.
- **Alternatives Considered**:
  - Completely replace `ProjectTeamDTO` with only nested fields: rejected because mock data and client components may have legacy assumptions that are easily preserved with optional fields.

### Decision 2: Defensive Role Handling in Badge Helper
- **Choice**: Update `getRoleBadgeVariant(role?: string | null)` to return `'secondary'` immediately if `!role`.
  ```ts
  const getRoleBadgeVariant = (role?: string | null) => {
    if (!role) return 'secondary';
    const lower = role.toLowerCase();
    if (lower === 'admin') return 'default';
    if (lower === 'developer' || lower === 'member') return 'secondary';
    return 'outline';
  };
  ```
- **Rationale**: Guarantees immunity against missing or nullish roles from any endpoint.
- **Alternatives Considered**:
  - Providing a default string in the call site: rejected because centralized null-safety in the helper protects all callers.

### Decision 3: OpenAPI Alignment for Team Assignment Payload
- **Choice**: Ensure `AssignProjectTeamRequest` requires `team_id: string` and treats `role?: string` as optional. When posting to `/api/v1/projects/:id/teams`, dispatch `{ team_id: payload.team_id }` conforming to the OpenAPI specification.
- **Rationale**: OpenAPI 3.0 specifies `{ team_id: uuid }` for `POST /projects/{id}/teams`. Sending extraneous keys could fail strict Serde deserializers on the backend.

## Risks / Trade-offs

- **[Risk] Revoking team assignment uses the wrong identifier**: If `team.id` is undefined on the live response (which provides `team_id` and `team.id`), revocation could fail.
  - **Mitigation**: Resolve revocation ID as `team.team_id || team.team?.id || team.id || ''`.
- **[Risk] Team member count is absent from the assignment response**: Live responses do not include `member_count`.
  - **Mitigation**: Display `team.member_count !== undefined ? `${team.member_count} members` : 'Team roster'` (already existing fallback).
