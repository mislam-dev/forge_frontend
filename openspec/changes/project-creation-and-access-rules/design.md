# Design

## Context

Forge project creation involves general project metadata, Git repository linking, and initial environment variable declarations. Previously:
- `NewProjectWizard.tsx` created the project record via `POST /api/v1/projects`, but did not issue dedicated calls to `POST /api/v1/projects/:id/repository` or `POST /api/v1/projects/:id/env-vars/bulk`.
- Personal workspace creation defaulted to a hardcoded organization ID (`org-1`).
- Intercepted creation modals remained mounted or failed to cleanly dismiss during router navigation.
- Project access controls exposed team assignment options alongside users, whereas projects should only assign user collaborators with proper roles.
- The sidebar navigation and dashboard overview displayed "Teams" even when the user was working in their personal workspace.

## Goals / Non-Goals

**Goals:**
- Sequentially persist project record, repository settings, and environment variables during project creation.
- Support personal workspace project creation without sending synthetic organization IDs.
- Ensure the creation modal closes cleanly when project creation succeeds.
- Restrict project access management (`/projects/[id]/access`) strictly to individual user collaborators with roles (`admin`, `developer`, `viewer`).
- Hide "Teams" navigation in the sidebar and dashboard overview when in personal workspace context.

**Non-Goals:**
- Removing organization-level teams (`/organizations/[id]/teams`). Teams remain valid for organization workspaces, but are not assigned to individual projects.

## Decisions

### 1. Project Creation API Pipeline
- **Decision**: In `NewProjectWizard.handleSubmit`:
  1. Call `createProject.mutateAsync` with `organization_id: activeOrgId || undefined`.
  2. If `step2.repository_url` is non-empty, call `apiClient.post(`/api/v1/projects/${created.id}/repository`, { ... })` sending both standard repository fields (`repo_url`, `repository_url`, `default_branch`, `branch`, `auth_token`, `access_token`, `auth_type`).
  3. If valid environment variable rows are present in step 3, format them and dispatch `POST /api/v1/projects/${created.id}/env-vars/bulk` (with fallback to individual `POST /api/v1/projects/${created.id}/env-vars` if needed).
  4. If any non-fatal child persistence fails, display a warning toast while still directing the user to their new project.

### 2. Modal Dismissal Lifecycle
- **Decision**: In `NewProjectWizardProps`, add `onSuccess?: (projectId: string) => void`.
- **Details**:
  - In `InterceptedNewProjectModal`, handle `onSuccess` by dismissing the dialog / calling `router.back()` and immediately navigating to `/projects/${id}`.
  - If standalone (non-modal), directly invoke `router.push('/projects/' + created.id)`.

### 3. Project Access Scoped to Users Only
- **Decision**: Remove the `target_type` toggle ('team' vs 'user') from `src/app/(dashboard)/projects/[id]/access/page.tsx`.
- **Details**:
  - Focus the modal and table strictly on user members: Email/Handle, Role (`admin`, `developer`, `viewer`), and assigned date.
  - Interact exclusively with `useProjectMembers` and `useAssignProjectMember` (`POST /api/v1/projects/:id/members`).
  - Update `ProjectHeader.tsx` tab label to "Access Control" or "Access".

### 4. Conditional Teams Visibility in Personal Workspace
- **Decision**: In `Sidebar.tsx`, compute navigation items dynamically based on `activeOrgId`:
  - If `!activeOrgId` (personal profile), filter out `{ name: 'Teams', href: '/teams', ... }`.
  - In `src/app/(dashboard)/dashboard/page.tsx`, conditionally render the "Teams & Access" card only when an organization is active.

## Risks / Trade-offs

- **[Risk]** Network delay during multi-step project creation (creating project + repo + env vars).
  - **Mitigation**: Keep loading state active on the submit button with descriptive status messages ("Creating project & saving settings...").
