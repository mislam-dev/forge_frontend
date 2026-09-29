# Spec Delta

## MODIFIED Requirements

### Requirement: Project Detail and Repository Settings
The system SHALL provide project overview details and repository configuration at `/projects/[id]` and `/projects/[id]/repository` allowing users to update repository URL, branch, and Personal Access Token (PAT) with Zod-driven schema validation and inline error messaging, supporting remote git validation, persistent linking, on-demand worker clone, commit inspection, branch switching, and remote branch listing in alignment with `/api/v1/projects/:id/repository/*`, transmitting repository connection payloads conforming to `ConnectProjectRepositoryDTO` (`repository_url`, `access_token`, `default_branch`).

#### Scenario: Updating repository configuration
- **WHEN** a user updates the repository branch or saves a new PAT secret and clicks "Save Changes"
- **THEN** the system SHALL submit a request to `POST /api/v1/projects/:id/repository` with a JSON payload containing `repository_url`, optional `access_token`, and optional `default_branch`, and confirm changes with a success notification.

#### Scenario: Repository validation error
- **WHEN** a user submits an empty repository URL or invalid Git URL format
- **THEN** the system SHALL prevent submission, suppress native HTML validation bubbles, and render an inline error message beneath the repository URL field.

#### Scenario: Validating remote git credentials and repository
- **WHEN** a user enters a Git repository URL and optional token and clicks validate
- **THEN** the system SHALL dispatch `POST /api/v1/projects/:id/repository/validate` and display the list of detected remote branches upon success.

#### Scenario: Triggering on-demand repository clone
- **WHEN** a user clicks "Clone Repository" from the repository settings interface
- **THEN** the system SHALL issue `POST /api/v1/projects/:id/repository/clone` and show an accepted notification confirming the clone job has begun.
