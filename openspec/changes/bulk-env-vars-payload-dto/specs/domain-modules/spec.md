# Spec Delta

## MODIFIED Requirements

### Requirement: Environment Variables Management & Secret Masking
The system SHALL provide an environment variable editor at `/projects/[id]/env-vars` supporting key-value additions, POSIX key format validation (`^[A-Z_][A-Z0-9_]*$`), environment scoping (production/staging/all), bulk `.env` syntax parsing, single and bulk creation, listing with environment filtering, editing, and deletion in accordance with `/api/v1/projects/:id/env-vars` endpoints.

#### Scenario: Adding and validating environment variable
- **WHEN** a user enters a valid POSIX key, value, and environment scope and clicks "Add"
- **THEN** the variable SHALL appear in the staging table ready for bulk save, rejecting invalid key names with descriptive validation errors.

#### Scenario: Toggling secret mask visibility
- **WHEN** a user clicks the reveal/hide icon on a masked secret value
- **THEN** the system SHALL toggle between asterisks and plaintext value using the EncryptedValueMasker component.

#### Scenario: Pasting raw .env content
- **WHEN** a user pastes multiline `KEY=VALUE` formatted strings into the bulk paste modal
- **THEN** the system SHALL parse all valid pairs into the variables table while reporting any malformed entries.

#### Scenario: Bulk creating environment variables
- **WHEN** a user saves or bulk-imports environment variables in the project wizard or environment variables editor
- **THEN** the system SHALL issue `POST /api/v1/projects/:id/env-vars/bulk` with an object payload formatted as `{ vars: [...] }` matching `BulkCreateProjectEnvVarDTO`, where each item includes `key`, `value`, `environment`, and optional `is_secret`.

#### Scenario: Updating and deleting an environment variable
- **WHEN** an authorized user edits or deletes a specific variable row
- **THEN** the system SHALL issue `PUT /api/v1/projects/:id/env-vars/:env_id` or `DELETE /api/v1/projects/:id/env-vars/:env_id` and update the active list.
