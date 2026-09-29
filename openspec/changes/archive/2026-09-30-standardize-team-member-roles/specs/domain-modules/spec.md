# Spec Delta

## MODIFIED Requirements

### Requirement: Global and Organization Teams Management
The system SHALL provide team management at `/teams` and `/organizations/[id]/teams` allowing users to view teams, create new teams, assign team members with designated roles strictly restricted to backend `TeamRole` enum variants (`viewer`, `developer`, `admin`), inspect team rosters safely handling backend member schemas (`team_id`, `user_id`, `role`, `joined_at`), update member roles, and remove members from a team, validated with React Hook Form and Zod schemas.

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
