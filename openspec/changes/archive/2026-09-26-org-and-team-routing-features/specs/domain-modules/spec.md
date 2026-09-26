# Spec Delta: domain-modules

## MODIFIED Requirements

### Requirement: Organizations and Tenant Management
The system SHALL provide role modification for existing organization members at `/organizations/[id]/members` with an interactive role selector, mutating the member's access level (`Owner`, `Admin`, `Member`, `Viewer`) via API and updating UI state immediately.

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

## ADDED Requirements

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
