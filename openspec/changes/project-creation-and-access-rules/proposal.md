# Proposal

## Why

When users create a new project using the creation wizard, the declared Git repository configuration and environment variables must be reliably persisted to the server via their dedicated endpoints, and intercepted modal dialogs must be dismissed cleanly. Furthermore, project access control should be scoped to individual users with specific roles rather than team entities, and team-related navigation must not appear when operating within the personal user workspace.

## What Changes

- **Persist Environment Variables to Server**: When creating a new project, invoke the environment variables API (`POST /api/v1/projects/:id/env-vars/bulk` or single) to store all declared variables on the server.
- **Persist Repository Configuration to Server**: Invoke the repository API (`POST /api/v1/projects/:id/repository`) with repository URL, default branch, and access tokens upon project creation.
- **Dismiss Creation Modal**: Ensure intercepted modal dialogs (`@modal/(.)projects/new`) cleanly close upon successful project creation and navigate to the project overview page.
- **Personal Workspace Scoping**: When in the personal workspace (`activeOrgId === null`), omit the organization ID instead of falling back to a synthetic organization ID (`org-1`).
- **Project Access Restricted to Users**: Update project access control at `/projects/[id]/access` and project navigation headers to manage user access with roles (`Admin`, `Developer`, `Viewer`), removing team assignment from project-level access.
- **Hide Teams in Personal Workspace**: Update the sidebar navigation and dashboard shortcuts so the "Teams" option is hidden whenever the user is in their personal workspace.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `domain-modules`:
  - Modify `Requirement: Multi-Step Project Creation Wizard` to persist repository configuration and environment variables to server endpoints, dismiss creation modals, and support personal workspace creation.
  - Modify `Requirement: Project Access Roles and Team Assignment` to restrict project-level access management to individual users with roles, removing team assignments from projects.
- `dashboard-shell`:
  - Modify `Requirement: Collapsible Navigation Sidebar` to conditionally hide team navigation items when operating in personal workspace context.

## Impact

- `src/components/projects/NewProjectWizard.tsx`: Call repository API and environment variables API upon project submission, handle personal workspace organization ID, and trigger modal closing.
- `src/app/(dashboard)/@modal/(.)projects/new/page.tsx`: Ensure clean dismissal and redirection.
- `src/app/(dashboard)/projects/[id]/access/page.tsx`: Restructure access form and list to focus solely on user role assignments.
- `src/components/projects/ProjectHeader.tsx`: Update tab label from "Access & Teams" to "Access Control".
- `src/components/layout/Sidebar.tsx`: Filter `navItems` to omit Teams when `!activeOrgId`.
- `src/app/(dashboard)/dashboard/page.tsx`: Conditionally render Teams quick link only when an organization is active.
