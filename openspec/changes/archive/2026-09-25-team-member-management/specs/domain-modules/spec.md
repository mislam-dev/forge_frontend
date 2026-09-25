# Spec Delta

## MODIFIED Requirements

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
