# Spec Delta

## MODIFIED Requirements

### Requirement: User Profile and Security Settings
The system SHALL provide settings interfaces at `/settings` and `/settings/security` allowing users to update their profile info (display name, email, avatar), change passwords, review active sessions marked with a "Static" badge without calling non-existent backend endpoints, and inspect MFA status, validating all user inputs with Zod schemas.

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
- **THEN** the system SHALL display inline validation messages beneath the password fields and block the submission.

#### Scenario: Reviewing active sessions with static indicator
- **WHEN** a user navigates to `/settings/security` or `/settings`
- **THEN** the system SHALL display the active sessions section with a visible "Static" badge and demo session data, without making network requests to `/api/v1/users/me/sessions`.
