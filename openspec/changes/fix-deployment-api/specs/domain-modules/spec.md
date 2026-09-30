# Spec Delta

## MODIFIED Requirements

### Requirement: Deployment History and Status Filtering
The system SHALL provide a paginated deployment history view at `/projects/[id]/deployments` displaying deployment ID, commit SHA, branch, initiator, trigger type, duration, and status badge with filtering by status (`Queued`, `Running`, `Success`, `Failed`, `Cancelled`), interacting with `GET /api/v1/projects/:id/deployments` for project history, `POST /api/v1/projects/:id/deployments` for triggering new deployments, and `/api/v1/projects/:id/rollback` for project rollbacks.

#### Scenario: Triggering a new deployment
- **WHEN** a developer clicks the deploy action from the project header, deployment history page, or redeploy button on a deployment detail page
- **THEN** the system SHALL dispatch a `POST /api/v1/projects/:id/deployments` request with the target project ID as a path parameter, optional `branch` and `commit_hash` in the JSON request body, and optional `Organization-ID` header, receiving HTTP 201 with the queued deployment data, displaying a safe confirmation notification without rendering undefined values, and navigating to or refreshing the deployment details.

#### Scenario: Triggering a deployment without project ID
- **WHEN** a deployment trigger is invoked without a valid target project identifier
- **THEN** the system SHALL reject the mutation client-side without dispatching an invalid HTTP request and notify the user with a descriptive error.
