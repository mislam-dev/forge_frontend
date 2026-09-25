# domain-modules Specification

## Purpose
Provides complete domain feature modules and user interfaces for project lifecycle management, real-time build streaming, secret management, team collaboration, notification feeds, and user account security.

## Requirements

### Requirement: Overview Dashboard Metrics & System Health
The system SHALL present an overview dashboard displaying aggregate system metrics (total projects, active deployments, system health status, and organization count) and recent deployment activity stream.

#### Scenario: Dashboard loads aggregate metrics successfully
- **WHEN** an authenticated user navigates to `/dashboard`
- **THEN** the system SHALL display metric cards for projects, deployments, organization count, system status, and a list of recent deployments with status badges.

#### Scenario: System health indicator reflects backend availability
- **WHEN** the backend health endpoint responds with operational status
- **THEN** the system SHALL render a green status indicator showing healthy services, or an alert badge when degraded.

### Requirement: Project Listing and Filtering
The system SHALL display all projects accessible to the active organization with real-time text filtering, runtime framework badges, git repository metadata, and last deployed timestamps.

#### Scenario: Filtering projects by keyword
- **WHEN** a user enters a search query in the project search input
- **THEN** the system SHALL immediately filter the project list matching the project name or repository URL without full page reload.

#### Scenario: Empty project state
- **WHEN** no projects exist for the selected organization
- **THEN** the system SHALL display an informative empty state card prompting the user to create their first project.

### Requirement: Multi-Step Project Creation Wizard
The system SHALL provide a guided 3-step wizard at `/projects/new` to create a project, configure repository source and branch, and optionally declare initial environment variables.

#### Scenario: Advancing through wizard steps with validation
- **WHEN** a user enters a valid project name and runtime and clicks "Next"
- **THEN** the system SHALL advance to the Git repository configuration step and validate repository URL and default branch before allowing progression to environment variables.

#### Scenario: Successful project creation
- **WHEN** a user completes all required wizard fields and submits the form
- **THEN** the system SHALL invoke the project creation API, display a success toast, and redirect the user to the newly created project overview page.

### Requirement: Project Detail and Repository Settings
The system SHALL provide project overview details and repository configuration at `/projects/[id]` and `/projects/[id]/repository` allowing users to update repository URL, branch, and Personal Access Token (PAT).

#### Scenario: Updating repository configuration
- **WHEN** a user updates the repository branch or saves a new PAT secret and clicks "Save Changes"
- **THEN** the system SHALL submit a PUT request to `/api/v1/projects/:id/repository` and confirm changes with a success notification.

### Requirement: Environment Variables Management & Secret Masking
The system SHALL provide an environment variable editor at `/projects/[id]/env-vars` supporting key-value additions, POSIX key format validation (`^[A-Z_][A-Z0-9_]*$`), environment scoping (production/staging/all), bulk `.env` syntax parsing, and secret value masking.

#### Scenario: Adding and validating environment variable
- **WHEN** a user enters a valid POSIX key, value, and environment scope and clicks "Add"
- **THEN** the variable SHALL appear in the staging table ready for bulk save, rejecting invalid key names with descriptive validation errors.

#### Scenario: Toggling secret mask visibility
- **WHEN** a user clicks the reveal/hide icon on a masked secret value
- **THEN** the system SHALL toggle between asterisks and plaintext value using the EncryptedValueMasker component.

#### Scenario: Pasting raw .env content
- **WHEN** a user pastes multiline `KEY=VALUE` formatted strings into the bulk paste modal
- **THEN** the system SHALL parse all valid pairs into the variables table while reporting any malformed entries.

### Requirement: Project Access Roles and Team Assignment
The system SHALL allow project administrators at `/projects/[id]/access` to inspect, assign, and revoke team or user permissions with distinct roles (`Admin`, `Member`, `Viewer`).

#### Scenario: Assigning team role to project
- **WHEN** an admin selects a team and assigns a role (`Viewer` or `Member`) and submits
- **THEN** the system SHALL update project access records and reflect the updated permission in the access table.

### Requirement: Deployment History and Status Filtering
The system SHALL provide a paginated deployment history view at `/projects/[id]/deployments` displaying deployment ID, commit SHA, branch, initiator, trigger type, duration, and status badge with filtering by status (`Queued`, `Running`, `Success`, `Failed`, `Cancelled`).

#### Scenario: Filtering deployments by status
- **WHEN** a user selects "Failed" from the deployment status filter dropdown
- **THEN** the system SHALL display only deployments matching the failed state.

### Requirement: Real-Time Deployment Log Streaming and Build Console
The system SHALL provide an interactive build console at `/projects/[id]/deployments/[depId]` rendering streaming Server-Sent Events (SSE) build logs with ANSI color rendering, auto-scrolling, fullscreen toggle, log download, and deployment control actions (cancel and redeploy).

#### Scenario: Streaming live logs over SSE
- **WHEN** a user opens an active deployment page
- **THEN** the system SHALL establish an EventSource connection to the log stream endpoint and append incoming log chunks into `SseLogViewer` in real-time.

#### Scenario: Triggering redeployment
- **WHEN** a user clicks the "Redeploy" button
- **THEN** the system SHALL submit a deployment trigger mutation, present a notification, and redirect to the newly queued deployment console.

### Requirement: Organizations and Tenant Management
The system SHALL provide organization views at `/organizations` and `/organizations/[id]` supporting organization listing, tenant creation, member role management (`Owner`, `Admin`, `Member`, `Viewer`), and email invitations.

#### Scenario: Creating a new organization
- **WHEN** a user inputs a valid organization name and submits the creation modal
- **THEN** the system SHALL create the organization, switch the active workspace context to it, and navigate to the new organization overview.

#### Scenario: Inviting a member to an organization
- **WHEN** an admin enters an invitee email and selects a role and sends invitation
- **THEN** the system SHALL dispatch an invitation request and display the pending invitation in the members table.

### Requirement: Global and Organization Teams Management
The system SHALL provide team management at `/teams` and `/organizations/[id]/teams` allowing users to view teams, create new teams, assign team members with designated roles, inspect team rosters, and remove members from a team.

#### Scenario: Creating a team
- **WHEN** a user fills in team name and description and clicks "Create Team"
- **THEN** the system SHALL persist the team and display it in the team directory card grid.

#### Scenario: Assigning a member to a team
- **WHEN** a user opens the team members management dialog, enters a member name or email with a designated role, and submits
- **THEN** the system SHALL add the member to the team roster, increment the team member count, and display the member in the team members list.

#### Scenario: Removing a member from a team
- **WHEN** a user clicks the remove action for a team member and confirms the action
- **THEN** the system SHALL remove the member from the team roster and update the team member count.

### Requirement: In-App Notifications Feed
The system SHALL provide a notification center at `/notifications` listing user notifications categorized by severity (info, warning, error, success) with read/unread filtering and mark-all-as-read capability.

#### Scenario: Marking all notifications as read
- **WHEN** a user clicks "Mark all as read"
- **THEN** the system SHALL update all unread notifications to read status and update the unread count badge in the Topbar.

### Requirement: User Profile and Security Settings
The system SHALL provide settings interfaces at `/settings` and `/settings/security` allowing users to update their profile info (display name, email, avatar), change passwords, review active sessions, and inspect MFA status.

#### Scenario: Updating profile information
- **WHEN** a user updates their display name and submits the profile form
- **THEN** the system SHALL send a PATCH request to `/api/v1/users/me` and update the active user store and topbar display.

#### Scenario: Changing user password
- **WHEN** a user supplies their current password and a new compliant password and clicks "Update Password"
- **THEN** the system SHALL submit the password change request and confirm with a success toast while clearing the form.

### Requirement: Offline Mock Provider and Fallback Simulation
The system SHALL include an offline mock data provider and SSE log emitter that seamlessly simulates API responses and build log streams when the Axum backend server is offline or when `NEXT_PUBLIC_ENABLE_MOCKS=true`.

#### Scenario: Graceful fallback when backend is unreachable
- **WHEN** API client requests fail due to connection refused or when mock flag is enabled
- **THEN** the system SHALL resolve mock response envelopes for projects, deployments, organizations, and metrics without breaking the UI.
