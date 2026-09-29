# Design

## Context

The backend Rust service strictly models team roles via the `TeamRole` enum:
```rust
pub enum TeamRole {
    Viewer = 1,
    Developer = 2,
    Admin = 3,
}

impl TeamRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            TeamRole::Viewer => "viewer",
            TeamRole::Developer => "developer",
            TeamRole::Admin => "admin",
        }
    }
}
```

The frontend had drift where `SUPPORTED_ROLES` included legacy roles (`lead`, `maintainer`, `member`) and defaulted to `member`. When submitting `member`, the backend rejected or mishandled the role value.

## Goals / Non-Goals

**Goals:**
- Formally define `TeamRole` (`'viewer' | 'developer' | 'admin'`) and `TEAM_ROLES` in `src/lib/api/types.ts`.
- Update `AddTeamMemberDTO`, `UpdateTeamMemberRoleRequest`, and `TeamMemberDTO` to use `TeamRole`.
- Update `addTeamMemberSchema` in `src/lib/validation/teams.ts` to validate using `z.enum(['viewer', 'developer', 'admin'])`.
- Restrict `SUPPORTED_ROLES` in `src/components/teams/TeamMembersManager.tsx` to `['viewer', 'developer', 'admin']` (or formatted equivalents).
- Update default role to `'developer'` when adding a new member.
- Ensure role badges and dropdown options consistently render standardized roles.

**Non-Goals:**
- Changing backend Rust code or database schemas.
- Modifying project member roles (which govern project access independently).

## Decisions

### 1. Centralized `TeamRole` Type and Constant
In `src/lib/api/types.ts`:
```ts
export type TeamRole = 'viewer' | 'developer' | 'admin';
export const TEAM_ROLES: TeamRole[] = ['viewer', 'developer', 'admin'];
```
Used in:
```ts
export interface AddTeamMemberDTO {
  user_id: string;
  role: TeamRole | string;
}

export interface UpdateTeamMemberRoleRequest {
  role: TeamRole | string;
}
```
Keeping `| string` in the DTO interfaces ensures safe compatibility when parsing un-narrowed backend payloads, while strictly typing form inputs.

### 2. Zod Enum Validation
In `src/lib/validation/teams.ts`:
```ts
export const addTeamMemberSchema = z.object({
  user_id: z.string().min(1, 'User is required').uuid('Invalid user UUID'),
  role: z.enum(['viewer', 'developer', 'admin'], {
    errorMap: () => ({ message: 'Role must be viewer, developer, or admin' }),
  }),
});
```

### 3. UI Alignment in TeamMembersManager
- Restrict `SUPPORTED_ROLES`:
  ```ts
  const SUPPORTED_ROLES: TeamRole[] = ['viewer', 'developer', 'admin'];
  ```
- Change `useForm` default values:
  ```ts
  defaultValues: {
    user_id: '',
    role: 'developer',
  }
  ```
- Ensure role selectors only offer `viewer`, `developer`, and `admin`, capitalized cleanly for display (`Viewer`, `Developer`, `Admin`).

## Risks / Trade-offs

- [Risk] Existing teams in local development environments might have members stored with legacy role strings (e.g. `'member'`).
  → *Mitigation*: The UI will gracefully display the raw or fallback role badge even if it does not match the active `TeamRole` enum, while disallowing creating or updating members with legacy roles.
