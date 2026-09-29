# Spec Delta

## MODIFIED Requirements

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
