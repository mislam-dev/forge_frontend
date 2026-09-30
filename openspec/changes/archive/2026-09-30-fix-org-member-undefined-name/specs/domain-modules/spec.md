# Spec Delta

## MODIFIED Requirements

### Requirement: Organizations and Tenant Management
The system SHALL provide organization views at `/organizations` and `/organizations/[id]` supporting organization listing, tenant creation, member role management (`Owner`, `Admin`, `Member`, `Viewer`), and email invitations, validated with Zod schemas and React Hook Form; member previews and member management tables SHALL safely render avatar initials, display labels, and action dialogs without runtime exceptions when member records lack a `name` property or contain null `email` values.

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
