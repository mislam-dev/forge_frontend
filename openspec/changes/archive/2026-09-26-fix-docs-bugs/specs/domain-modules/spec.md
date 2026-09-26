# Spec Delta: domain-modules

## MODIFIED Requirements

### Requirement: Organizations and Tenant Management
The system SHALL provide direct removal of organization members at `/organizations/[id]/members` with an accessible confirmation dialog and server mutation.

#### Scenario: Removing an organization member
- **WHEN** an administrator clicks "Remove" on a member row in the organization members table and confirms
- **THEN** the system SHALL invoke `DELETE /api/v1/organizations/:id/members/:memberId`, remove the member from the table, and display a confirmation toast.

### Requirement: Global and Organization Teams Management
The system SHALL allow administrators in `TeamMembersDialog` to edit an existing team member's role (`Lead`, `Maintainer`, `Member`, `Viewer`) via an interactive selector.

#### Scenario: Updating a team member role
- **WHEN** a user selects a different role from the role selector dropdown next to a team member
- **THEN** the system SHALL send a `PATCH /api/v1/teams/:id/members/:memberId` mutation and update the member's role badge/state immediately.

### Requirement: Multi-Step Project Creation Wizard
The system SHALL provide an eye icon toggle button on each environment variable input row in Step 3 of `/projects/new` to toggle visibility between masked password characters and cleartext.

#### Scenario: Toggling secret visibility in project creation
- **WHEN** a user clicks the eye icon next to an environment variable value input
- **THEN** the input type toggles between `password` and `text`, updating the icon between `Eye` and `EyeOff`.

### Requirement: Project Detail and Repository Settings
The repository configuration at `/projects/[id]/repository` SHALL include a Git URL validation section allowing users to test repository connectivity and format syntax.

#### Scenario: Validating Git repository URL
- **WHEN** a user enters a Git repository URL and clicks "Validate URL"
- **THEN** the system verifies the URL format and reachability, displaying a visual validation badge (`Valid`, `Auth Required`, or `Invalid URL`).

### Requirement: Environment Variables Management & Secret Masking
The environment variables editor at `/projects/[id]/env-vars` SHALL support inline or modal editing of existing secret values instead of displaying purely static masked spans.

#### Scenario: Editing an existing environment variable value
- **WHEN** a user clicks to edit or enters a new value into an existing variable's secret field
- **THEN** the field accepts new input, supports show/hide secret toggling, and saves the updated value upon clicking "Save Variables".

### Requirement: In-App Notifications Feed
The notification center at `/notifications` SHALL support filtering across multiple notification categories (`deployment`, `security`, `team`, `system`) and severity levels via dedicated filter dropdown menus.

#### Scenario: Filtering notifications by category and severity
- **WHEN** a user selects a category (e.g. "Security") or severity from the filter dropdowns
- **THEN** the notification feed displays only matching notifications.

### Requirement: User Profile and Security Settings
The system SHALL provide a dedicated settings landing/overview at `/settings` with structured navigation cards for Profile Information, Security & Sessions, and Preferences.

#### Scenario: Navigating to the settings overview
- **WHEN** an authenticated user opens `/settings`
- **THEN** the system displays a settings hub with navigation links and summaries for account sub-sections.
