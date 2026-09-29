# Proposal

## Why

Project access control at `/projects/[id]/access` currently mixes direct member assignments and team assignments without considering whether the project resides in a user's personal space or an organization's workspace. In personal workspaces, projects do not belong to an organization and have no teams; therefore, the team feature must be completely hidden, and project access must exclusively use `/projects/{id}/members` APIs to grant and revoke individual collaborator access. When operating inside an organization's workspace, teams must be visible and manageable using the 3 project team assignment APIs (`GET`, `POST`, `DELETE /api/v1/projects/:id/teams`).

## What Changes

- **Workspace-Aware Project Access Control**:
  - In **Personal Workspace** (`activeOrgId === null`):
    - Hide all team tabs, team assignment forms, and team-related UI components.
    - Exclusively manage direct user collaborators via `/api/v1/projects/:id/members` endpoints (`GET`, `POST`, `DELETE /api/v1/projects/:id/members/:user_id`).
  - In **Organization Workspace** (`activeOrgId !== null`):
    - Display team assignment functionality alongside direct members (via clear tabs or separated sections for "Direct Members" and "Assigned Teams").
    - Implement team assignment using `POST /api/v1/projects/:id/teams` (`{ team_id, role }`), with a dropdown populated from organization teams (`GET /api/v1/teams?org_id=:org_id`).
    - Implement team removal using `DELETE /api/v1/projects/:id/teams/:team_id`.
- **API Hooks & Types Refinement**:
  - Ensure `useProjectMembers`, `useAssignProjectMember`, and `useRemoveProjectMember` handle direct member queries and mutations cleanly with proper query invalidation.
  - Ensure `useProjectTeams`, `useAssignProjectTeam`, and `useRemoveProjectTeam` handle team queries and mutations cleanly.
  - Support proper project roles (`admin`, `developer`, `viewer` for direct members; `developer`, `viewer` for teams).
- **Validation & Forms**:
  - Update `src/lib/validation/projects.ts` and `ProjectAccessPage` dialogs to validate user inputs cleanly for both member assignment and team assignment.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `domain-modules`: Update `Requirement: Project Access Roles and Team Assignment` to specify personal workspace isolation (exclusively direct members via `/projects/{id}/members`) and organization workspace team assignment management (via `/projects/{id}/teams`).

## Impact

- **UI**: `/projects/[id]/access` renders conditional views based on active workspace (personal space vs organization space).
- **API Integrations**: Strictly routes user collaboration to `/api/v1/projects/:id/members` and organization team assignment to `/api/v1/projects/:id/teams`.
- **Files Affected**:
  - `src/app/(dashboard)/projects/[id]/access/page.tsx`
  - `src/lib/hooks/api/useProjectAccess.ts`
  - `src/lib/validation/projects.ts`
  - `src/lib/api/types.ts` (if any schema adjustments needed)
