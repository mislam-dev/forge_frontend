# Design

## Context

The Axum backend provides the endpoint `POST /api/v1/teams/:team_id/members` which expects payloads strictly conforming to:
```rust
#[derive(Debug, Deserialize, Serialize, Validate)]
pub struct AddTeamMemberDTO {
    pub user_id: Uuid,
    #[validate(length(min = 1, message = "Role cannot be empty"))]
    pub role: String,
}
```
Currently, `AddTeamMemberRequest` and `addTeamMemberSchema` were configured to accept `{ name, email, role }`, resulting in JSON deserialization errors due to a missing `user_id`.

## Goals / Non-Goals

**Goals:**
- Formally define `AddTeamMemberDTO` in `src/lib/api/types.ts` requiring `{ user_id: string; role: string }` and alias `AddTeamMemberRequest` to it.
- Update `addTeamMemberSchema` in `src/lib/validation/teams.ts` to validate `{ user_id: string; role: string }` (ensuring non-empty UUID and role).
- Ensure `useAddTeamMember` in `src/lib/hooks/api/useTeams.ts` forwards `{ user_id, role }`.
- Upgrade the Add Member UI in `src/components/teams/TeamMembersManager.tsx`:
  - When organization members are available, present a user selector dropdown showing member names and emails while setting `user_id`.
  - Filter out users who are already enrolled in the team to prevent duplicate assignments.
  - Allow manual UUID input as an alternative or when no organization members are loaded.
  - Standardize role options (`admin`, `lead`, `maintainer`, `member`, `developer`, `viewer`).

**Non-Goals:**
- Modifying backend Rust structs or API routes.
- Changing project member assignment schemas (already aligned).

## Decisions

### 1. Schema & DTO Alignment
```ts
export interface AddTeamMemberDTO {
  user_id: string;
  role: string;
}
export type AddTeamMemberRequest = AddTeamMemberDTO;
```
Validation schema:
```ts
export const addTeamMemberSchema = z.object({
  user_id: z.string().min(1, 'User is required').uuid('Invalid user UUID'),
  role: z.string().min(1, 'Role cannot be empty'),
});
```
- *Rationale*: Directly mirrors the backend's Axum serde expectations and validator requirements.

### 2. User Selection UX in TeamMembersManager
- In an organization workspace, `useOrgMembers(activeOrgId)` is queried.
- An `availableOrgMembers` list computes `orgMembers.filter(om => !members.some(m => m.user_id === om.user_id))`.
- The user can select from this list in a dropdown.
- An inline toggle ("Enter UUID manually") allows entering arbitrary user UUIDs if needed.
- *Rationale*: Eliminates manual copy-pasting of UUIDs for organization colleagues while strictly sending the required `user_id` to the API.

## Risks / Trade-offs

- [Risk] A user attempts to submit without picking a valid user.
  → *Mitigation*: Zod validation flags empty or non-UUID inputs with clear inline messages.
- [Risk] Organization member list is still loading when opening add form.
  → *Mitigation*: Show loading indicator or fallback to direct UUID input.
