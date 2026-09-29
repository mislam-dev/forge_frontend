# Proposal

## Why

When viewing team members in `TeamMembersDialog.tsx`, the frontend crashes with:
```
TypeError: Cannot read properties of undefined (reading 'slice')
    at TeamMembersDialog.tsx:320:34
    at Array.map (<anonymous>)
    at TeamMembersDialog (TeamMembersDialog.tsx:313:21)
```
The Axum backend endpoint `GET /api/v1/teams/:team_id/members` returns team member objects with `{ team_id, user_id, role, joined_at }`. It does not include `id`, `name`, or `email`. The frontend expected `member.name` and `member.email` to always be defined and called `.slice(0, 2)` directly on `member.name`, leading to an unhandled exception caught by the dashboard error boundary.

## What Changes

- **Update `TeamMemberDTO` interface**: Make `name`, `email`, and `id` optional in `TeamMemberDTO`, and ensure `user_id`, `team_id`, `role`, and `joined_at` are properly typed.
- **Defensive rendering in `TeamMembersDialog`**:
  - Safe avatar initials computation: use `(member.name || member.email || member.user_id || 'U').slice(0, 2).toUpperCase()`.
  - Fallback display name: render `member.name || member.email || `User (${member.user_id.slice(0, 8)})``.
  - Safely render email only if present, or secondary info like `user_id` / joined date.
  - Fix element keys and action identifiers to use `member.id || member.user_id`.
  - Optional enrichment: when inside an organization workspace, optionally map `user_id` against cached organization members to resolve names and emails where available.
- **Role handling**: Normalize team member roles to accommodate backend casing (such as `"admin"`, `"member"`, `"developer"`, `"viewer"` as well as `"Lead"`, `"Maintainer"`), ensuring role dropdowns and badges reflect the member's current role without crashing.

## Capabilities

### New Capabilities
*(None)*

### Modified Capabilities
- `domain-modules`: Update team members inspection and roster display requirements so the frontend tolerates backend team member records containing only `{ team_id, user_id, role, joined_at }`.

## Impact

- `src/lib/api/types.ts`: `TeamMemberDTO` schema definition.
- `src/components/teams/TeamMembersDialog.tsx`: Avatar fallback, user name/email fallback, role handling, and member action identifiers.
- `src/lib/hooks/api/useTeams.ts`: Hook signatures and mutations for team member role updates and removals using `user_id || member_id`.
