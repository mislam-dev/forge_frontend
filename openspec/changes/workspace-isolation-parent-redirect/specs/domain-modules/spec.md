# Spec Delta

## MODIFIED Requirements

### Requirement: Workspace Navigation & Organization Scope
The system SHALL eliminate the global "All Organizations" directory page (`/organizations`) and its corresponding breadcrumb back-links, redirecting any requests for `/organizations` to the user's active organization (`/organizations/[id]`), and SHALL enforce workspace route isolation by redirecting to `/dashboard` when personal workspace is activated, and redirecting child project and team routes to their respective parent directories when organization workspaces switch or do not match.

#### Scenario: Navigating to `/organizations`
- **WHEN** a user visits `/organizations` directly or through legacy links
- **THEN** the system SHALL immediately redirect the user to `/organizations/${activeOrgId || 'org-1'}`.

#### Scenario: Viewing organization detail header
- **WHEN** a user views an organization page (`/organizations/[id]`, `/organizations/[id]/members`, `/organizations/[id]/teams`)
- **THEN** the header SHALL NOT display an "All Organizations" breadcrumb back button.

#### Scenario: Switching workspace while inside a project child route
- **WHEN** a user switches to another organization workspace while currently viewing a project child route (`/projects/[id]`, `/projects/[id]/*`, or `/projects/new`)
- **THEN** the system SHALL redirect the user to the parent route `/projects`.

#### Scenario: Switching workspace while inside a team child route
- **WHEN** a user switches to another organization workspace while currently viewing a team child route (`/teams/[id]/*` or `/teams/new`)
- **THEN** the system SHALL redirect the user to the parent route `/teams`.

#### Scenario: Switching to personal workspace while inside projects or teams
- **WHEN** a user switches to personal profile workspace while currently on any project route (`/projects`, `/projects/[id]/*`), team route (`/teams`, `/teams/[id]/*`), or organization route
- **THEN** the system SHALL redirect the user to `/dashboard`.

#### Scenario: Accessing project or team from mismatched workspace
- **WHEN** a user navigates to a project or team whose organization identifier does not match the active workspace context
- **THEN** the system SHALL enforce isolation and redirect the user to `/dashboard` (if personal workspace is active) or the parent route (`/projects` for projects, `/teams` for teams).
