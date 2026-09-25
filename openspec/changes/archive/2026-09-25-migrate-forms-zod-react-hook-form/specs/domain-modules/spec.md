# Spec Delta

## MODIFIED Requirements

### Requirement: Multi-Step Project Creation Wizard
The system SHALL provide a guided 3-step wizard at `/projects/new` to create a project, configure repository source and branch, and optionally declare initial environment variables, using React Hook Form and Zod schemas with inline error messages and no native browser validation.

#### Scenario: Advancing through wizard steps with validation
- **WHEN** a user enters a valid project name and runtime and clicks "Next"
- **THEN** the system SHALL advance to the Git repository configuration step and validate repository URL and default branch before allowing progression to environment variables.

#### Scenario: Validation failure on project wizard step
- **WHEN** a user submits step 1 or step 2 with missing or invalid fields
- **THEN** the system SHALL prevent navigation to the next step, suppress native browser validation popups, and display inline field error messages styled with the theme's destructive token.

#### Scenario: Successful project creation
- **WHEN** a user completes all required wizard fields and submits the form
- **THEN** the system SHALL invoke the project creation API, display a success toast, and redirect the user to the newly created project overview page.

### Requirement: Project Detail and Repository Settings
The system SHALL provide project overview details and repository configuration at `/projects/[id]` and `/projects/[id]/repository` allowing users to update repository URL, branch, and Personal Access Token (PAT) with Zod-driven schema validation and inline error messaging.

#### Scenario: Updating repository configuration
- **WHEN** a user updates the repository branch or saves a new PAT secret and clicks "Save Changes"
- **THEN** the system SHALL submit a PUT request to `/api/v1/projects/:id/repository` and confirm changes with a success notification.

#### Scenario: Repository validation error
- **WHEN** a user submits an empty repository URL or invalid Git URL format
- **THEN** the system SHALL prevent submission, suppress native HTML validation bubbles, and render an inline error message beneath the repository URL field.

### Requirement: Project Access Roles and Team Assignment
The system SHALL allow project administrators at `/projects/[id]/access` to inspect, assign, and revoke team or user permissions with distinct roles (`Admin`, `Member`, `Viewer`) using a schema-validated assignment dialog.

#### Scenario: Assigning team role to project
- **WHEN** an admin selects a team and assigns a role (`Viewer` or `Member`) and submits
- **THEN** the system SHALL update project access records and reflect the updated permission in the access table.

#### Scenario: Validation failure on role assignment
- **WHEN** an admin submits the assignment modal without selecting a target entity
- **THEN** the system SHALL display an inline validation error and block the mutation.

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

#### Scenario: Invalid invitation email
- **WHEN** an admin inputs an invalid email format into the invite member form and submits
- **THEN** the system SHALL display an inline email validation error message and prevent the invitation request.

### Requirement: Global and Organization Teams Management
The system SHALL provide team management at `/teams` and `/organizations/[id]/teams` allowing users to view teams, create new teams, assign team members with designated roles, inspect team rosters, and remove members from a team, validated with React Hook Form and Zod schemas.

#### Scenario: Creating a team
- **WHEN** a user fills in team name and description and clicks "Create Team"
- **THEN** the system SHALL persist the team and display it in the team directory card grid.

#### Scenario: Team creation validation failure
- **WHEN** a user submits an empty team name in the team creation modal
- **THEN** the system SHALL show an inline validation message and prevent creation.

#### Scenario: Assigning a member to a team
- **WHEN** a user opens the team members management dialog, enters a member name or email with a designated role, and submits
- **THEN** the system SHALL add the member to the team roster, increment the team member count, and display the member in the team members list.

#### Scenario: Member assignment validation failure
- **WHEN** a user attempts to add a member with an invalid email or blank name
- **THEN** the system SHALL display inline validation error messages and keep the form open for correction.

#### Scenario: Removing a member from a team
- **WHEN** a user clicks the remove action for a team member and confirms the action
- **THEN** the system SHALL remove the member from the team roster and update the team member count.

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
- **THEN** the system SHALL block submission and render inline password requirement error messages.
