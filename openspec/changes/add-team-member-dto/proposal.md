# Proposal

## Why

The backend Axum service requires team member assignment payloads to conform strictly to:
```rust
#[derive(Debug, Deserialize, Serialize, Validate)]
pub struct AddTeamMemberDTO {
    pub user_id: Uuid,
    #[validate(length(min = 1, message = "Role cannot be empty"))]
    pub role: String,
}
```
Currently, the frontend's add member form and validation schema in `teams.ts` collect `{ name, email, role }`, resulting in deserialization errors on the backend due to a missing `user_id` field.

## What Changes

- **DTO Definition**: Define `AddTeamMemberDTO` in `src/lib/api/types.ts` with `{ user_id: string; role: string }` and alias `AddTeamMemberRequest` to it.
- **Validation Schema**: Update `addTeamMemberSchema` in `src/lib/validation/teams.ts` to validate `{ user_id: string, role: string }` (requiring valid UUID and non-empty role).
- **API Hook Update**: Ensure `useAddTeamMember` in `src/lib/hooks/api/useTeams.ts` dispatches strictly `{ user_id, role }` to `POST /api/v1/teams/:team_id/members`.
- **UI Form Update**: Update `TeamMembersManager.tsx`:
  - When in an organization workspace, provide a dropdown to select an organization member (displaying member name & email), automatically populating `user_id`.
  - Support manual UUID input for environments without preloaded organization members.
  - Map selected role to a non-empty string (e.g. `"admin"`, `"member"`, `"developer"`, `"viewer"`).

## Capabilities

### New Capabilities
*(None)*

### Modified Capabilities
- `domain-modules`: Update team member assignment requirements to require `user_id` and `role` matching `AddTeamMemberDTO`.

## Impact

- `src/lib/api/types.ts`: `AddTeamMemberDTO` and `AddTeamMemberRequest` interface definitions.
- `src/lib/validation/teams.ts`: `addTeamMemberSchema` and `AddTeamMemberValues`.
- `src/lib/hooks/api/useTeams.ts`: `useAddTeamMember` hook payload.
- `src/components/teams/TeamMembersManager.tsx`: Add Member form fields and submission payload.
