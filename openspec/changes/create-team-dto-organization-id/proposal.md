# Proposal

## Why

When creating a new team via `POST /api/v1/teams`, the backend Axum server returns a deserialization error:
`"Failed to deserialize the JSON body into the target type: missing field organization_id at line 1 column 82"`.

The backend DTO expects:
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

The frontend currently sends `org_id` instead of `organization_id`, and `description` instead of `descriptions`. Aligning the team creation types, forms, and hooks to strictly match `CreateTeamDTO` resolves this deserialization failure.

## What Changes

- **Define `CreateTeamDTO` in `src/lib/api/types.ts`**:
  - Export `CreateTeamDTO` with `organization_id: string`, `name: string`, and `descriptions?: string | null`.
  - Update `CreateTeamRequest` to alias or extend `CreateTeamDTO`.
- **Update `useCreateTeam` in `src/lib/hooks/api/useTeams.ts`**:
  - Serialize `{ organization_id, name, descriptions }` matching `CreateTeamDTO`.
- **Update `CreateTeamForm.tsx` & Organization Teams Page**:
  - Ensure `organization_id` is always a valid UUID (derived from active organization workspace or organization route parameter).
  - When creating a team outside an active organization context, provide an organization selector populated from `useOrganizationsList()`.
  - Pass `descriptions: values.description?.trim() || null` to the creation mutation.
- **Update Validation Schema**:
  - Update `createTeamSchema` in `src/lib/validation/teams.ts` to allow up to 255 characters for team name matching the backend validation.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `domain-modules`: Update `Requirement: Global and Organization Teams Management` to specify that team creation dispatches `POST /api/v1/teams` with a payload conforming to `CreateTeamDTO` (`organization_id`, `name`, `descriptions`).

## Impact

- **API Payloads**: `POST /api/v1/teams` payload conforms strictly to `CreateTeamDTO`.
- **Files Affected**:
  - `src/lib/api/types.ts`
  - `src/lib/hooks/api/useTeams.ts`
  - `src/components/teams/CreateTeamForm.tsx`
  - `src/app/(dashboard)/organizations/[id]/teams/page.tsx`
  - `src/lib/validation/teams.ts`
