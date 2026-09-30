# Spec Delta

## MODIFIED Requirements

### Requirement: Workspace Navigation & Organization Scope
The system SHALL eliminate the global "All Organizations" directory page (`/organizations`) and its corresponding breadcrumb back-links, redirecting any requests for `/organizations` to the user's active organization (`/organizations/[id]`), and SHALL enforce workspace route isolation by redirecting to `/dashboard` when personal workspace is activated, and redirecting child project, child team, and organization routes when organization workspaces switch or do not match; during page reloads or initial page loads, workspace route isolation evaluation SHALL be deferred until application store hydration and entity data loading are complete.

#### Scenario: Navigating to `/organizations`
- **WHEN** a user visits `/organizations` directly or through legacy links
- **THEN** the system SHALL immediately redirect the user to `/organizations/${activeOrgId || 'org-1'}`.

#### Scenario: Viewing organization detail header
- **WHEN** a user views an organization page (`/organizations/[id]`, `/organizations/[id]/members`)
- **THEN** the header SHALL NOT display an "All Organizations" breadcrumb back button, and SHALL NOT display a Teams tab.

#### Scenario: Reloading a team member view or scoped page
- **WHEN** a user reloads or directly visits a team member view (`/teams/[id]/members`), teams directory (`/teams`), or project child route while in an organization workspace
- **THEN** the system SHALL NOT immediately redirect to `/dashboard`, SHALL display a loading skeleton while store hydration and resource queries resolve, and SHALL retain the user on the requested view once the active organization matches the entity's organization.

#### Scenario: Switching workspace while inside a project child route
- **WHEN** a user switches to another organization workspace while currently viewing a project child route (`/projects/[id]`, `/projects/[id]/*`, or `/projects/new`)
- **THEN** the system SHALL redirect the user to the parent route `/projects`.

#### Scenario: Switching workspace while inside a team child route
- **WHEN** a user switches to another organization workspace while currently viewing a team child route (`/teams/[id]/*` or `/teams/new`)
- **THEN** the system SHALL redirect the user to the parent route `/teams`.

#### Scenario: Switching to personal workspace while inside projects or teams
- **WHEN** a user switches to personal profile workspace while currently on any project route (`/projects`, `/projects/[id]/*`), team route (`/teams`, `/teams/[id]/*`), or organization route
- **THEN** the system SHALL redirect the user to `/dashboard`.

#### Scenario: Switching organization workspace while on an organization route
- **WHEN** a user switches to a different organization workspace while viewing an organization page (`/organizations/[id]`, `/organizations/[id]/members`)
- **THEN** the system SHALL redirect the user to the overview page of the newly selected organization (`/organizations/${newOrgId}`).

#### Scenario: Accessing organization view with mismatched active workspace
- **WHEN** a user loads or views an organization route (`/organizations/[id]`, `/organizations/[id]/members`) where the path `id` does not match the active workspace context after store hydration
- **THEN** the system SHALL enforce isolation and redirect the user to `/dashboard` if personal workspace is active, or redirect to `/organizations/${activeOrgId}` if in an organization workspace.

#### Scenario: Accessing project or team from mismatched workspace after load
- **WHEN** a user navigates to or loads a project or team whose organization identifier does not match the active workspace context after store hydration and queries complete
- **THEN** the system SHALL enforce isolation and redirect the user to `/dashboard` (if personal workspace is active) or the parent route (`/projects` for projects, `/teams` for teams).

### Requirement: Organizations and Tenant Management
The system SHALL provide organization views at `/organizations` and `/organizations/[id]` supporting organization listing, tenant creation, member role management (`Owner`, `Admin`, `Member`, `Viewer`), and email invitations, validated with Zod schemas and React Hook Form; member previews and member management tables SHALL safely render avatar initials, display labels, and action dialogs without runtime exceptions when member records lack a `name` property or contain null `email` values; the organization detail view and header SHALL omit internal team tabs and preview widgets, consolidating team interactions into the primary sidebar teams section.

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

#### Scenario: Viewing organization members preview when member names are undefined
- **WHEN** an authenticated user views `/organizations/[id]` and the API returns member records conforming to `OrgMemberResponse` without `name` fields
- **THEN** the Members Preview card SHALL render without runtime exceptions, deriving display initials from available identifiers (`email`, `user_id`, or a fallback placeholder) and displaying a fallback user identifier.

#### Scenario: Viewing organization members management table when member names are undefined
- **WHEN** an administrator views `/organizations/[id]/members` and member records lack `name` fields
- **THEN** the members table SHALL render without throwing exceptions, computing avatar initials safely and displaying the available email or fallback label, and role change / removal actions SHALL reference the member's valid identifier (`user_id` or `id`).

### Requirement: Global and Organization Teams Management
The system SHALL provide team management centralized at `/teams` (and `/teams/[id]/members`) allowing users to view teams, create new teams, assign team members with designated roles strictly restricted to backend `TeamRole` enum variants (`viewer`, `developer`, `admin`), inspect team rosters safely handling backend member schemas (`team_id`, `user_id`, `role`, `joined_at`), update member roles, and remove members from a team, validated with React Hook Form and Zod schemas; requests to legacy `/organizations/[id]/teams` SHALL redirect to `/teams`.

#### Scenario: Creating a team
- **WHEN** a user fills in team name and description and clicks "Create Team"
- **THEN** the system SHALL persist the team and display it in the team directory card grid.

#### Scenario: Team creation validation failure
- **WHEN** a user submits an empty team name in the team creation modal
- **THEN** the system SHALL show an inline validation message and prevent creation.

#### Scenario: Inspecting team members roster with backend schema
- **WHEN** a user opens the team members dialog for a team whose members are returned with `{ team_id, user_id, role, joined_at }`
- **THEN** the system SHALL render the members list without throwing exceptions, safely generating fallback avatar initials, displaying user identifiers or resolved organization member details, and displaying normalized role badges (`viewer`, `developer`, `admin`).

#### Scenario: Assigning a member to a team
- **WHEN** a user opens the team members management dialog, selects or enters a member identifier with a designated role (`viewer`, `developer`, `admin`), and submits
- **THEN** the system SHALL dispatch `POST /api/v1/teams/:teamId/members` with the chosen role, add the member to the team roster, and update the team member count.

#### Scenario: Updating a team member role
- **WHEN** an authorized user selects a new role (`viewer`, `developer`, `admin`) for an existing member from the roster role dropdown
- **THEN** the system SHALL dispatch `PATCH /api/v1/teams/:teamId/members/:userId` with `{ role }` and update the member's displayed role.

#### Scenario: Member assignment validation failure
- **WHEN** a user attempts to add a member with an invalid email or blank name
- **THEN** the system SHALL display inline validation error messages and keep the form open for correction.

#### Scenario: Removing a member from a team
- **WHEN** a user clicks the remove action for a team member identified by `user_id` or `id` and confirms the action
- **THEN** the system SHALL remove the member from the team roster and update the team member count.

#### Scenario: Accessing legacy organization teams route
- **WHEN** a user navigates to `/organizations/[id]/teams` directly or through legacy links
- **THEN** the system SHALL redirect the user to `/teams`.
