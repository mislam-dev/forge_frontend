# Design

## Context

See `proposal.md` for motivation.

Forge supports both personal spaces (individual users) and organization workspaces (multi-tenant teams).
In the frontend, this state is tracked in `useWorkspaceStore`:
- `activeOrgId === null`: Personal workspace mode.
- `activeOrgId !== null`: Organization workspace mode with `activeOrgId`.

Backend endpoints for project access assignments are divided into two distinct sets:
1. **Direct Project Members**:
   - `GET /api/v1/projects/:id/members`
   - `POST /api/v1/projects/:id/members` (`{ user_id: string, role: string }`)
   - `DELETE /api/v1/projects/:id/members/:user_id`
2. **Project Team Assignments**:
   - `GET /api/v1/projects/:id/teams`
   - `POST /api/v1/projects/:id/teams` (`{ team_id: string, role: string }`)
   - `DELETE /api/v1/projects/:id/teams/:team_id`

## Goals / Non-Goals

**Goals:**
- In Personal Workspace (`activeOrgId === null`):
  - Completely suppress team features, tabs, headers, dialogs, and mutation buttons.
  - Exclusively query and manage direct project members using `/projects/{id}/members` endpoints.
  - Provide an "Assign Member" modal with role selection (`Admin`, `Developer`, `Viewer`) and clean deletion confirmation.
- In Organization Workspace (`activeOrgId !== null`):
  - Display team management features alongside direct members.
  - Implement a tabbed interface ("Collaborators" and "Assigned Teams").
  - Under "Assigned Teams", list teams attached to the project (`GET /projects/{id}/teams`).
  - Provide an "Assign Team" modal that loads organization teams (`GET /api/v1/teams?org_id=:org_id`) in a `<select>` dropdown, with role options (`Developer`, `Viewer`).
  - Allow removing assigned teams via `DELETE /projects/{id}/teams/{team_id}`.
- Optimize network queries: do not trigger team queries when in personal space.

**Non-Goals:**
- Altering backend API route signatures or database tables.
- Modifying organization-wide member invitations (which live at `/organizations/[id]/members`).

## Decisions

### Decision 1: Workspace-Aware UI Layout
- In `src/app/(dashboard)/projects/[id]/access/page.tsx`, read `activeOrgId` from `useWorkspaceStore`.
- If `!activeOrgId`:
  - Render a single-view layout dedicated to Direct User Collaborators.
  - Do not render tabs or any references to teams.
- If `Boolean(activeOrgId)`:
  - Render a top-level tab switcher:
    - Tab 1: **Direct Collaborators** (`useProjectMembers`)
    - Tab 2: **Assigned Teams** (`useProjectTeams`)
  - Each tab has its own dedicated assignment dialog and table actions.

### Decision 2: Separate Querying & Mutations
- Instead of relying on the legacy combined `useProjectAccess`, use:
  - `useProjectMembers(projectId)` - always enabled for the project.
  - `useProjectTeams(projectId)` - only enabled when `Boolean(activeOrgId)`.
  - `useTeamsList(activeOrgId)` - to populate the team selector in the assignment modal, enabled when `Boolean(activeOrgId)`.
- This avoids unnecessary network round-trips for team endpoints in personal space.

### Decision 3: Assignment Modals & Validation
- Split or specialize the assignment forms:
  - Member assignment: `user_id` (string) + `role` (`admin` | `developer` | `viewer`).
  - Team assignment: `team_id` (string) + `role` (`developer` | `viewer`).
- Schema validation in `src/lib/validation/projects.ts` will support:
  - `projectMemberAssignSchema`: `{ user_id: string, role: z.enum(['admin', 'developer', 'viewer']) }`
  - `projectTeamAssignSchema`: `{ team_id: string, role: z.enum(['developer', 'viewer']) }`

## Risks / Trade-offs

- **[Risk] User enters an email instead of UUID for `user_id` when assigning a member.**
  → *Mitigation*: The input placeholder and label will say "User ID or Email" and the API client error interceptor (`extractApiErrorMessage`) will display the exact backend error toast if the identifier is not found or invalid.
