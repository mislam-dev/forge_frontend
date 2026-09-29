# Design

## Context

See `proposal.md` for motivation.

The backend endpoint `POST /api/v1/teams` expects a JSON body deserializable into:
```rust
pub struct CreateTeamDTO {
    pub organization_id: Uuid,
    #[validate(length(
        min = 2,
        max = 255,
        message = "Team name must be between 2 and 255 characters"
    ))]
    pub name: String,
    pub descriptions: Option<String>,
}
```

The frontend currently sends `{ org_id, description, name }` or defaults `org_id` to `'org-1'`, resulting in Serde deserialization failure:
`"missing field organization_id at line 1 column 82"`.

## Goals / Non-Goals

**Goals:**
- Export `CreateTeamDTO` in `src/lib/api/types.ts`:
  ```ts
  export interface CreateTeamDTO {
    organization_id: string;
    name: string;
    descriptions?: string | null;
  }
  ```
- Standardize `CreateTeamRequest` to alias `CreateTeamDTO` (with optional backward-compatible aliases `description?: string | null`, `org_id?: string`).
- Update `useCreateTeam` in `src/lib/hooks/api/useTeams.ts` to construct and dispatch `{ organization_id, name, descriptions }`.
- Update `CreateTeamForm.tsx` to:
  - Support `organizationId?: string` prop.
  - Resolve the organization ID from prop, active workspace (`activeOrgId`), or an inline organization selector when creating a team from a personal space.
  - Pass `organization_id` and `descriptions: values.description?.trim() || null`.
- Update `src/app/(dashboard)/organizations/[id]/teams/page.tsx` to send `organization_id: orgId` and `descriptions`.
- Update `src/lib/validation/teams.ts` to expand `name` maximum length from 50 to 255 characters.

**Non-Goals:**
- Altering backend code or database schemas.
- Modifying team member management endpoints (`/api/v1/teams/:id/members/*`).

## Decisions

### Decision 1: Explicit `CreateTeamDTO` and Hook Normalization
- **Choice**: The hook `useCreateTeam` will normalize inputs so `organization_id` and `descriptions` are guaranteed in the outgoing HTTP POST request:
  ```ts
  const body: CreateTeamDTO = {
    organization_id: payload.organization_id || payload.org_id!,
    name: payload.name.trim(),
    descriptions: payload.descriptions ?? payload.description ?? null,
  };
  ```
- **Rationale**: Ensures that whether callers use `CreateTeamDTO` directly or legacy parameter names, the HTTP payload strictly conforms to the Axum backend Serde struct.

### Decision 2: Handling Organization Context in `CreateTeamForm`
- **Choice**: In `CreateTeamForm`:
  - If `organizationId` is passed, use it.
  - Else if `activeOrgId` is non-null, use it.
  - Else (personal space / standalone `/teams/new`), fetch available organizations via `useOrganizationsList()` and display an organization selector. If the user has no organizations, show an informative card prompting them to create an organization first.
- **Rationale**: Teams require a valid organization UUID in Forge. Sending dummy strings like `'org-1'` causes UUID deserialization failures.

## Risks / Trade-offs

- **[Risk] User has zero organizations when creating a team at `/teams/new`.**
  → *Mitigation*: Show an empty state in `CreateTeamForm` with a button to "Create Organization" first, preventing invalid form submissions.
