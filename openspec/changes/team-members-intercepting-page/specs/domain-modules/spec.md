# Spec Delta

## ADDED Requirements

### Requirement: Team Members Management Parallel & Intercepted Route
The system SHALL support dedicated routing for team member management at `/teams/[id]/members` with Next.js parallel and intercepting routes, rendering inside a modal overlay (`@modal/(.)teams/[id]/members`) during client-side navigation from team lists and as a full standalone management page upon direct browser visits.

#### Scenario: Client navigation to manage team members
- **WHEN** a user clicks "Members" on a team card in `/teams` or `/organizations/[id]/teams`
- **THEN** the URL updates to `/teams/[id]/members`, and the team member roster opens inside an intercepted modal dialog without unmounting the background page.

#### Scenario: Dismissing intercepted team members modal
- **WHEN** a user clicks "Close", clicks outside, or cancels the intercepted team members modal
- **THEN** the modal closes and the URL reverts to the previous page via `router.back()`.

#### Scenario: Standalone direct navigation to team members management
- **WHEN** a user directly navigates to or hard-refreshes `/teams/[id]/members`
- **THEN** the system SHALL render the standalone team members management page within the dashboard layout with back navigation to `/teams` and team metadata.
