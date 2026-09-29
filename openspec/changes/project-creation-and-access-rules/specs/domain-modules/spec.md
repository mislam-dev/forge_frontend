# Spec Delta

## MODIFIED Requirements

### Requirement: Multi-Step Project Creation Wizard
The system SHALL provide a guided 3-step wizard at `/projects/new` to create a project, configure repository source and branch, and optionally declare initial environment variables, using React Hook Form and Zod schemas with inline error messages and no native browser validation, restricting selectable runtimes to backend-supported variants (`NodeJs`, `Python`, `Go`, `Static`) and project types (`Repo`, `Files`), persisting repository settings and environment variables to server endpoints, and cleanly dismissing intercepted creation modals.

#### Scenario: Advancing through wizard steps with validation
- **WHEN** a user enters a valid project name and runtime and clicks "Next"
- **THEN** the system SHALL advance to the Git repository configuration step and validate repository URL and default branch before allowing progression to environment variables.

#### Scenario: Validation failure on project wizard step
- **WHEN** a user submits step 1 or step 2 with missing or invalid fields
- **THEN** the system SHALL prevent navigation to the next step, suppress native browser validation popups, and display inline field error messages styled with the theme's destructive token.

#### Scenario: Successful project creation
- **WHEN** a user completes all required wizard fields and submits the form
- **THEN** the system SHALL invoke the project creation API, persist Git repository details and declared environment variables to the backend, dismiss the modal dialog if opened via parallel routes, and redirect to the newly created project overview page.

#### Scenario: Validating and serializing supported runtime variants
- **WHEN** a user selects a runtime from the wizard card grid (such as Node.js, Python, Go, or Static Site)
- **THEN** the system SHALL serialize the payload as the expected PascalCase variant (`NodeJs`, `Python`, `Go`, `Static`) and project type (`Repo`, `Files`) without casing discrepancies.

#### Scenario: Persisting environment variables to server
- **WHEN** a project is created with valid initial environment variables defined in step 3
- **THEN** the system SHALL dispatch an API request to `/api/v1/projects/:id/env-vars/bulk` (or `/api/v1/projects/:id/env-vars`) to persist the key, value, and environment scope on the server.

#### Scenario: Persisting repository configuration to server
- **WHEN** a project is created with Git repository details in step 2
- **THEN** the system SHALL dispatch an API request to `POST /api/v1/projects/:id/repository` saving the repository URL, branch, and credentials.

#### Scenario: Creating project in personal workspace
- **WHEN** a user creates a project while active in their personal workspace (`activeOrgId` is null)
- **THEN** the system SHALL NOT submit a fallback organization identifier (`org-1`) and SHALL omit or pass null for `organization_id`.

### Requirement: Project Access Roles and Team Assignment
The system SHALL allow project administrators at `/projects/[id]/access` to inspect, assign, and revoke user access permissions with distinct roles (`admin`, `developer`, `viewer`) using a schema-validated assignment dialog and dedicated `/api/v1/projects/:id/members` endpoints, scoping project access strictly to user collaborators without team entities.

#### Scenario: Assigning team role to project
- **WHEN** an admin manages access on a project
- **THEN** access management SHALL be restricted to user collaborator accounts with proper roles (`admin`, `developer`, `viewer`), and team entity assignment SHALL NOT be available for projects.

#### Scenario: Validation failure on role assignment
- **WHEN** an admin submits the assignment modal without selecting a target entity
- **THEN** the system SHALL display an inline validation error and block the mutation.

#### Scenario: Assigning a user to a project
- **WHEN** an admin selects a user and assigns a role (`admin`, `developer`, `viewer`)
- **THEN** the system SHALL dispatch `POST /api/v1/projects/:id/members` with `{ user_id, role }` and update the member list.

#### Scenario: Removing user or team from project
- **WHEN** an admin removes an assigned user or collaborator from the project
- **THEN** the system SHALL dispatch `DELETE /api/v1/projects/:id/members/:user_id` and remove the row from view.
