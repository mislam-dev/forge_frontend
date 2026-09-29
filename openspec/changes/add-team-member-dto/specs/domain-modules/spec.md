# Spec Delta

## MODIFIED Requirements

### Requirement: Global and Organization Teams Management
The system SHALL provide team management at `/teams` and `/organizations/[id]/teams` allowing users to view teams, create new teams, assign team members with designated roles via `AddTeamMemberDTO` (`user_id`, `role`), inspect team rosters safely handling minimal backend member schemas (`team_id`, `user_id`, `role`, `joined_at`), and remove members from a team, validated with React Hook Form and Zod schemas.

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
- **WHEN** an admin selects an organization member or provides a user ID with a designated role and submits the assignment form
- **THEN** the system SHALL dispatch `POST /api/v1/teams/:team_id/members` with `{ user_id, role }`, add the member to the team roster, increment the team member count, and display the member in the team members list.

#### Scenario: Member assignment validation failure
- **WHEN** a user attempts to add a member without selecting or providing a valid user UUID or with a blank role
- **THEN** the system SHALL display inline validation error messages and keep the form open for correction.

#### Scenario: Removing a member from a team
- **WHEN** a user clicks the remove action for a team member identified by `user_id` or `id` and confirms the action
- **THEN** the system SHALL remove the member from the team roster and update the team member count.
