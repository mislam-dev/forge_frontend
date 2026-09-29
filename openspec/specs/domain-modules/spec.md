# domain-modules Specification

## Purpose
Provides complete domain feature modules and user interfaces for project lifecycle management, real-time build streaming, secret management, team collaboration, notification feeds, and user account security.

## Requirements

### Requirement: Overview Dashboard Metrics & System Health
The system SHALL present an overview dashboard displaying aggregate system metrics (total projects, active deployments, system health status, and organization count) and recent deployment activity stream, interacting with `/api/v1/dashboard/user`, `/api/v1/dashboard/org/:org_id`, `/api/v1/dashboard`, and health probes (`/api/v1/health/live`, `/api/v1/health/ready`, `/api/v1/health/deep`).

#### Scenario: Dashboard loads aggregate metrics successfully
- **WHEN** an authenticated user navigates to `/dashboard`
- **THEN** the system SHALL display metric cards for projects, deployments, organization count, system status, and a list of recent deployments with status badges.

#### Scenario: System health indicator reflects backend availability
- **WHEN** the backend health endpoint responds with operational status
- **THEN** the system SHALL render a green status indicator showing healthy services, or an alert badge when degraded.

### Requirement: Project Listing and Filtering
The system SHALL display all projects accessible to the active organization with real-time text filtering, runtime framework badges, git repository metadata, and last deployed timestamps, supporting filtering across backend runtime variants (`NodeJs`, `Python`, `Go`, `Static`).

#### Scenario: Filtering projects by keyword
- **WHEN** a user enters a search query in the project search input
- **THEN** the system SHALL immediately filter the project list matching the project name or repository URL without full page reload.

#### Scenario: Empty project state
- **WHEN** no projects exist for the selected organization
- **THEN** the system SHALL display an informative empty state card prompting the user to create their first project.

#### Scenario: Filtering projects by runtime variant
- **WHEN** a user selects a runtime filter badge (`NodeJs`, `Python`, `Go`, `Static`)
- **THEN** the system SHALL filter the project cards matching the selected runtime variant.

### Requirement: Multi-Step Project Creation Wizard
The system SHALL provide a guided 3-step wizard at `/projects/new` to create a project, configure repository source and branch, and optionally declare initial environment variables, using React Hook Form and Zod schemas with inline error messages and no native browser validation, restricting selectable runtimes to backend-supported variants (`NodeJs`, `Python`, `Go`, `Static`) and project types (`Repo`, `Files`) and serializing them matching the Axum backend Serde enum variants.

#### Scenario: Advancing through wizard steps with validation
- **WHEN** a user enters a valid project name and runtime and clicks "Next"
- **THEN** the system SHALL advance to the Git repository configuration step and validate repository URL and default branch before allowing progression to environment variables.

#### Scenario: Validation failure on project wizard step
- **WHEN** a user submits step 1 or step 2 with missing or invalid fields
- **THEN** the system SHALL prevent navigation to the next step, suppress native browser validation popups, and display inline field error messages styled with the theme's destructive token.

#### Scenario: Successful project creation
- **WHEN** a user completes all required wizard fields and submits the form
- **THEN** the system SHALL invoke the project creation API, display a success toast, and redirect the user to the newly created project overview page.

#### Scenario: Validating and serializing supported runtime variants
- **WHEN** a user selects a runtime from the wizard card grid (such as Node.js, Python, Go, or Static Site)
- **THEN** the system SHALL serialize the payload as the expected PascalCase variant (`NodeJs`, `Python`, `Go`, `Static`) and project type (`Repo`, `Files`) without casing discrepancies.

### Requirement: Project Detail and Repository Settings
The system SHALL provide project overview details and repository configuration at `/projects/[id]` and `/projects/[id]/repository` allowing users to update repository URL, branch, and Personal Access Token (PAT) with Zod-driven schema validation and inline error messaging, supporting remote git validation, persistent linking, on-demand worker clone, commit inspection, branch switching, and remote branch listing in alignment with `/api/v1/projects/:id/repository/*`, transmitting repository connection payloads conforming to `ConnectProjectRepositoryDTO` (`repository_url`, `access_token`, `default_branch`).

#### Scenario: Updating repository configuration
- **WHEN** a user updates the repository branch or saves a new PAT secret and clicks "Save Changes"
- **THEN** the system SHALL submit a request to `POST /api/v1/projects/:id/repository` with a JSON payload containing `repository_url`, optional `access_token`, and optional `default_branch`, and confirm changes with a success notification.

#### Scenario: Repository validation error
- **WHEN** a user submits an empty repository URL or invalid Git URL format
- **THEN** the system SHALL prevent submission, suppress native HTML validation bubbles, and render an inline error message beneath the repository URL field.

#### Scenario: Validating remote git credentials and repository
- **WHEN** a user enters a Git repository URL and optional token and clicks validate
- **THEN** the system SHALL dispatch `POST /api/v1/projects/:id/repository/validate` and display the list of detected remote branches upon success.

#### Scenario: Triggering on-demand repository clone
- **WHEN** a user clicks "Clone Repository" from the repository settings interface
- **THEN** the system SHALL issue `POST /api/v1/projects/:id/repository/clone` and show an accepted notification confirming the clone job has begun.

### Requirement: Environment Variables Management & Secret Masking
The system SHALL provide an environment variable editor at `/projects/[id]/env-vars` supporting key-value additions, POSIX key format validation (`^[A-Z_][A-Z0-9_]*$`), environment scoping restricted to `Development`, `Production`, and `Staging`, bulk `.env` syntax parsing, single and bulk creation, listing with environment filtering, editing, and deletion in accordance with `/api/v1/projects/:id/env-vars` endpoints.

#### Scenario: Adding and validating environment variable
- **WHEN** a user enters a valid POSIX key, value, and selects an environment from `Development`, `Production`, or `Staging` and clicks "Add"
- **THEN** the variable SHALL appear in the staging table ready for bulk save, rejecting invalid key names with descriptive validation errors.

#### Scenario: Toggling secret mask visibility
- **WHEN** a user clicks the reveal/hide icon on a masked secret value
- **THEN** the system SHALL toggle between asterisks and plaintext value using the EncryptedValueMasker component.

#### Scenario: Pasting raw .env content
- **WHEN** a user pastes multiline `KEY=VALUE` formatted strings into the bulk paste modal
- **THEN** the system SHALL parse all valid pairs into the variables table defaulting to `Production` environment while reporting any malformed entries.

#### Scenario: Bulk creating environment variables
- **WHEN** a user saves or bulk-imports environment variables in the project wizard or environment variables editor
- **THEN** the system SHALL issue `POST /api/v1/projects/:id/env-vars/bulk` with an object payload formatted as `{ vars: [...] }` matching `BulkCreateProjectEnvVarDTO`, ensuring each item specifies `environment` as one of `"Development"`, `"Production"`, or `"Staging"`.

#### Scenario: Updating and deleting an environment variable
- **WHEN** an authorized user edits or deletes a specific variable row
- **THEN** the system SHALL issue `PUT /api/v1/projects/:id/env-vars/:env_id` or `DELETE /api/v1/projects/:id/env-vars/:env_id` and update the active list.

### Requirement: Project Access Roles and Team Assignment
The system SHALL provide workspace-aware access control at `/projects/[id]/access`: when in a personal workspace (`activeOrgId === null`), the system SHALL hide team management features and exclusively allow project administrators to inspect, assign, and revoke individual user collaborators with roles (`admin`, `developer`, `viewer`) using dedicated `/api/v1/projects/:id/members` endpoints; when in an organization workspace (`activeOrgId !== null`), the system SHALL display the team assignment feature and allow project administrators to inspect, assign, and revoke teams with roles (`developer`, `viewer`) via `/api/v1/projects/:id/teams` endpoints alongside direct member management.

#### Scenario: Assigning team role to project
- **WHEN** an admin selects an organization team and assigns a role (`viewer` or `developer`) in an organization workspace
- **THEN** the system SHALL dispatch `POST /api/v1/projects/:id/teams` with `{ team_id, role }` and reflect the assigned team in the project teams list.

#### Scenario: Validation failure on role assignment
- **WHEN** an admin submits the assignment modal without selecting a target entity or providing a valid identifier
- **THEN** the system SHALL display an inline validation error and block the mutation.

#### Scenario: Assigning a user to a project
- **WHEN** an admin selects or enters a user identifier and assigns a role (`admin`, `developer`, `viewer`)
- **THEN** the system SHALL dispatch `POST /api/v1/projects/:id/members` with `{ user_id, role }` and update the member list.

#### Scenario: Removing user or team from project
- **WHEN** an admin removes an assigned user or team from the project
- **THEN** the system SHALL dispatch `DELETE /api/v1/projects/:id/members/:user_id` for user members or `DELETE /api/v1/projects/:id/teams/:team_id` for teams and remove the corresponding record from view.

#### Scenario: Navigating project access in personal workspace
- **WHEN** a user navigates to `/projects/[id]/access` while personal workspace is active
- **THEN** the system SHALL render only the direct member collaborator management view and suppress all team assignment options, team lists, and team tabs.

### Requirement: Deployment History and Status Filtering
The system SHALL provide a paginated deployment history view at `/projects/[id]/deployments` displaying deployment ID, commit SHA, branch, initiator, trigger type, duration, and status badge with filtering by status (`Queued`, `Running`, `Success`, `Failed`, `Cancelled`), interacting with `/api/v1/projects/:id/deployments` for project history and `/api/v1/deployments` for triggering new deployments, redeploying, or rolling back.

#### Scenario: Filtering deployments by status
- **WHEN** a user selects "Failed" from the deployment status filter dropdown
- **THEN** the system SHALL display only deployments matching the failed state.

#### Scenario: Triggering a new deployment
- **WHEN** a developer initiates a build from the dashboard or project header
- **THEN** the system SHALL dispatch `POST /api/v1/deployments` with `{ project_id, branch, commit_hash, environment }` and redirect to the deployment detail.

#### Scenario: Rolling back a project
- **WHEN** an authorized user selects a healthy past deployment and triggers rollback
- **THEN** the system SHALL dispatch `POST /api/v1/projects/:id/rollback` with target environment and deployment ID.

### Requirement: Real-Time Deployment Log Streaming and Build Console
The system SHALL provide an interactive build console at `/projects/[id]/deployments/[depId]` rendering streaming Server-Sent Events (SSE) build logs via `/api/v1/deployments/:id/logs/stream`, query stored logs via `/api/v1/deployments/:id/logs`, keyword search logs via `/api/v1/deployments/:id/logs/search`, download raw logs via `/api/v1/deployments/:id/logs/download`, and deployment control actions (cancel and redeploy).

#### Scenario: Streaming live logs over SSE
- **WHEN** a user opens an active deployment page
- **THEN** the system SHALL establish an EventSource connection to the log stream endpoint `/api/v1/deployments/:id/logs/stream` and append incoming log chunks into `SseLogViewer` in real-time.

#### Scenario: Triggering redeployment
- **WHEN** a user clicks the "Redeploy" button
- **THEN** the system SHALL submit `POST /api/v1/deployments/:id/redeploy`, present a notification, and redirect to the newly queued deployment console.

#### Scenario: Searching historical build logs
- **WHEN** a user enters a search term in the deployment log search bar
- **THEN** the system SHALL dispatch `GET /api/v1/deployments/:id/logs/search?q=...` and display matched lines with line context.

#### Scenario: Downloading raw deployment log file
- **WHEN** a user clicks "Download Logs"
- **THEN** the browser triggers download of `/api/v1/deployments/:id/logs/download` as a `.log` attachment.

### Requirement: Organizations and Tenant Management
The system SHALL provide organization views at `/organizations` and `/organizations/[id]` supporting organization listing, tenant creation, member role management (`Owner`, `Admin`, `Member`, `Viewer`), and email invitations, validated with Zod schemas and React Hook Form.

#### Scenario: Creating a new organization
- **WHEN** a user inputs a valid organization name and submits the creation modal
- **THEN** the system SHALL create the organization, switch the active workspace context to it, and navigate to the new organization overview.

#### Scenario: Organization creation validation failure
- **WHEN** a user submits an empty or whitespace-only organization name
- **THEN** the system SHALL display an inline validation error message beneath the name input without browser native popups.

#### Scenario: Inviting a member to an organization
- **WHEN** an admin enters an invitee email and selects a role and sends invitation
- **THEN** the system SHALL dispatch an invitation request and display the pending invitation in the members table.

#### Scenario: Updating an organization member role
- **WHEN** an administrator selects a new role (`Owner`, `Admin`, `Member`, `Viewer`) for a member in the organization members table
- **THEN** the system SHALL invoke `PATCH /api/v1/organizations/:id/members/:memberId` with `{ role }`, update the member's role in the table, and display a confirmation toast.

### Requirement: Workspace Navigation & Organization Scope
The system SHALL eliminate the global "All Organizations" directory page (`/organizations`) and its corresponding breadcrumb back-links, redirecting any requests for `/organizations` to the user's active organization (`/organizations/[id]`).

#### Scenario: Navigating to `/organizations`
- **WHEN** a user visits `/organizations` directly or through legacy links
- **THEN** the system SHALL immediately redirect the user to `/organizations/${activeOrgId || 'org-1'}`.

#### Scenario: Viewing organization detail header
- **WHEN** a user views an organization page (`/organizations/[id]`, `/organizations/[id]/members`, `/organizations/[id]/teams`)
- **THEN** the header SHALL NOT display an "All Organizations" breadcrumb back button.

### Requirement: Team Creation Parallel & Intercepted Route
The system SHALL support Next.js parallel and intercepting routing for team creation via route `/teams/new`, rendering within a modal overlay (`@modal/(.)teams/new`) during client-side navigation from the Teams list and as a full standalone page upon direct browser visits.

#### Scenario: Client navigation to create team
- **WHEN** a user clicks "New Team" on `/teams`
- **THEN** the URL updates to `/teams/new`, and the team creation form opens inside an intercepted modal dialog without unmounting the underlying teams page.

#### Scenario: Dismissing intercepted team creation modal
- **WHEN** a user clicks "Cancel", clicks outside, or submits the team creation form in the intercepted modal
- **THEN** the modal closes and the URL reverts to `/teams` via `router.back()`.

#### Scenario: Standalone direct navigation to team creation
- **WHEN** a user directly navigates to or hard-refreshes `/teams/new`
- **THEN** the system renders the standalone team creation page in the dashboard shell without modal dialog wrapping.

### Requirement: Organization Creation Parallel & Intercepted Route
The system SHALL support Next.js parallel and intercepting routing for organization creation via route `/organizations/new`, rendering within a modal overlay (`@modal/(.)organizations/new`) during client-side navigation from the workspace switcher and as a full standalone page upon direct browser visits.

#### Scenario: Client navigation to create organization
- **WHEN** a user selects "Create Organization" from the sidebar workspace switcher
- **THEN** the URL updates to `/organizations/new`, and the organization creation form opens inside an intercepted modal dialog over the active page.

#### Scenario: Standalone direct navigation to organization creation
- **WHEN** a user directly navigates to or hard-refreshes `/organizations/new`
- **THEN** the system renders the standalone organization creation page in the dashboard shell.

### Requirement: Global and Organization Teams Management
The system SHALL provide team management at `/teams` and `/organizations/[id]/teams` allowing users to view teams, create new teams, assign team members with designated roles, inspect team rosters safely handling minimal backend member schemas (`team_id`, `user_id`, `role`, `joined_at`), and remove members from a team, validated with React Hook Form and Zod schemas.

#### Scenario: Creating a team
- **WHEN** a user fills in team name and description and clicks "Create Team"
- **THEN** the system SHALL persist the team and display it in the team directory card grid.

#### Scenario: Team creation validation failure
- **WHEN** a user submits an empty team name in the team creation modal
- **THEN** the system SHALL show an inline validation message and prevent creation.

#### Scenario: Inspecting team members roster with backend schema
- **WHEN** a user opens the team members dialog for a team whose members are returned with `{ team_id, user_id, role, joined_at }`
- **THEN** the system SHALL render the members list without throwing exceptions, safely generating fallback avatar initials, displaying user identifiers or resolved organization member details, and displaying normalized role badges.

#### Scenario: Assigning a member to a team
- **WHEN** a user opens the team members management dialog, enters a member name or email with a designated role, and submits
- **THEN** the system SHALL add the member to the team roster, increment the team member count, and display the member in the team members list.

#### Scenario: Member assignment validation failure
- **WHEN** a user attempts to add a member with an invalid email or blank name
- **THEN** the system SHALL display inline validation error messages and keep the form open for correction.

#### Scenario: Removing a member from a team
- **WHEN** a user clicks the remove action for a team member identified by `user_id` or `id` and confirms the action
- **THEN** the system SHALL remove the member from the team roster and update the team member count.

### Requirement: In-App Notifications Feed
The system SHALL provide a notification center at `/notifications` listing user notifications categorized by severity (info, warning, error, success) with read/unread filtering, unread count polling via `GET /api/v1/notifications/unread-count`, single read via `PATCH /api/v1/notifications/:id/read`, mark-all-read via `PATCH /api/v1/notifications/read-all`, dismissal via `DELETE /api/v1/notifications/:id`, and live SSE alerts via `GET /api/v1/notifications/stream`.

#### Scenario: Marking all notifications as read
- **WHEN** a user clicks "Mark all as read"
- **THEN** the system SHALL invoke `PATCH /api/v1/notifications/read-all`, update all unread notifications to read status, and reset the unread count badge in the Topbar.

#### Scenario: Live notification pushes
- **WHEN** an SSE connection to `/api/v1/notifications/stream` receives an incoming alert event
- **THEN** the system SHALL increment unread counts and display a toast alert in the Topbar.

### Requirement: User Profile and Security Settings
The system SHALL provide settings interfaces at `/settings` and `/settings/security` allowing users to update their profile info (display name, email, avatar), change passwords, review active sessions, and inspect MFA status, validating all user inputs with Zod schemas.

#### Scenario: Updating profile information
- **WHEN** a user updates their display name and submits the profile form
- **THEN** the system SHALL send a PATCH request to `/api/v1/users/me` and update the active user store and topbar display.

#### Scenario: Profile validation failure
- **WHEN** a user clears required profile fields like first name or supplies an invalid email
- **THEN** the system SHALL render inline validation errors beneath the invalid fields.

#### Scenario: Changing user password
- **WHEN** a user supplies their current password and a new compliant password and clicks "Update Password"
- **THEN** the system SHALL submit the password change request and confirm with a success toast while clearing the form.

#### Scenario: Password validation failure
- **WHEN** a user submits a new password that is shorter than 8 characters or when the confirmation password does not match
- **THEN** the system SHALL display inline validation messages beneath the password fields and block the submission.

### Requirement: Offline Mock Provider and Fallback Simulation
The system SHALL include an offline mock data provider and SSE log emitter that seamlessly simulates API responses and build log streams according to the OpenAPI 3.0 path conventions and response envelopes when the Axum backend server is offline or when `NEXT_PUBLIC_ENABLE_MOCKS=true`.

#### Scenario: Graceful fallback when backend is unreachable
- **WHEN** API client requests fail due to connection refused or when mock flag is enabled
- **THEN** the system SHALL resolve mock response envelopes for OpenAPI routes (`/api/v1/deployments`, `/api/v1/projects/:id/repository/*`, `/api/v1/projects/:id/env-vars`, `/api/v1/dashboard/*`, `/api/v1/access-control/*`) without breaking the UI.
