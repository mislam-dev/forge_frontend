# Proposal

## Why

When users switch workspaces (between organizations or to personal profile) while inspecting a specific project (`/projects/[id]/*`, `/projects/new`) or team (`/teams/[id]/*`, `/teams/new`), the application currently leaves the browser on the child route of the previous workspace. This breaks workspace isolation and causes requests to fail or display mismatched data under the newly selected workspace header. Navigating between workspaces must isolate resources: if switching to personal workspace, the user is redirected to the `/dashboard` page; if switching to another organization workspace, child routes redirect to their parent directory (`/projects` for projects, `/teams` for teams).

## What Changes

- Enhance workspace switching logic in `src/components/layout/Sidebar.tsx`:
  - When switching to personal workspace from any project or team route (or organization route), automatically redirect to `/dashboard`.
  - When switching between organizations:
    - If on a project child route (`/projects/[id]/*`, `/projects/new`), redirect to the parent `/projects`.
    - If on a team child route (`/teams/[id]/*`, `/teams/new`), redirect to the parent `/teams`.
    - If on an organization route (`/organizations/[id]/*`), redirect to `/organizations/${newOrg.id}` (or `/dashboard`).
- Introduce a workspace isolation check in `ProjectHeader` / project pages and team standalone pages:
  - If a loaded project's `organization_id` does not match the active `activeOrgId`, redirect to `/dashboard` (if personal) or `/projects` (if in an organization).
  - If a team page is active while in personal workspace or the team's `organization_id` does not match the active `activeOrgId`, redirect to `/dashboard` (if personal) or `/teams` (if in an organization).

## Capabilities

### Modified Capabilities
- `domain-modules`: Update requirement `Workspace Navigation & Organization Scope` to specify route isolation for projects and teams, ensuring switching to personal workspace redirects to `/dashboard`, and switching between organizations redirects child routes to their parent directory.

## Impact

- `src/components/layout/Sidebar.tsx`: Update `handleSelectPersonal` and `handleSelectOrg` with route-aware parent/dashboard redirection.
- `src/components/projects/ProjectHeader.tsx`: Add active workspace comparison check with parent/dashboard redirection on mismatch.
- `src/app/(dashboard)/teams/[id]/members/page.tsx` & `src/app/(dashboard)/teams/page.tsx`: Enforce organization workspace guard and redirect to `/dashboard` or `/teams`.
