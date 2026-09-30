# Spec Delta

## MODIFIED Requirements

### Requirement: Deployment History and Status Filtering
The system SHALL provide a paginated deployment history view at `/projects/[id]/deployments` displaying deployment ID or sequence number, commit SHA/hash, branch, initiator, duration, and status badge with filtering by status (`Queued`, `Running`, `Success`, `Failed`, `Cancelled`), interacting with `GET /api/v1/projects/:id/deployments` for project history, `POST /api/v1/projects/:id/deployments` for triggering new deployments, and `/api/v1/projects/:id/rollback` for project rollbacks.

#### Scenario: Unwrapping paginated deployment response envelopes
- **WHEN** the backend returns a paginated envelope response containing `{ data: { data: [...], page, per_page, total, total_pages }, message }` from `GET /api/v1/projects/:id/deployments`
- **THEN** the client hook SHALL unwrap the nested deployment records from `data.data` and render the items in the deployment history and project summary tables.

#### Scenario: Rendering deployment identifiers with graceful fallbacks
- **WHEN** a deployment record does not contain a sequential `deployment_number`
- **THEN** the system SHALL display the shortened deployment UUID `#${id.slice(0, 8)}` instead of rendering undefined or an empty hashtag.

#### Scenario: Rendering commit information with hash fallbacks
- **WHEN** a deployment record provides `commit_hash` but omits `commit_sha`
- **THEN** the system SHALL display the `commit_hash` as the commit reference.

#### Scenario: Displaying failure diagnostics on failed deployments
- **WHEN** a deployment is in `Failed` status and includes an `error_message`
- **THEN** the system SHALL display the error message in the deployment list and deployment console to provide immediate diagnostic visibility.

#### Scenario: Filtering deployments by status
- **WHEN** a user selects "Failed" from the deployment status filter dropdown
- **THEN** the system SHALL display only deployments matching the failed state.

#### Scenario: Triggering a new deployment
- **WHEN** a developer clicks the deploy action from the project header, deployment history page, or redeploy button on a deployment detail page
- **THEN** the system SHALL dispatch a `POST /api/v1/projects/:id/deployments` request with the target project ID as a path parameter, optional `branch` and `commit_hash` in the JSON request body, and optional `Organization-ID` header, receiving HTTP 201 with the queued deployment data, displaying a safe confirmation notification without rendering undefined values, and navigating to or refreshing the deployment details.

#### Scenario: Triggering a deployment without project ID
- **WHEN** a deployment trigger is invoked without a valid target project identifier
- **THEN** the system SHALL reject the mutation client-side without dispatching an invalid HTTP request and notify the user with a descriptive error.

#### Scenario: Rolling back a project
- **WHEN** an authorized user selects a healthy past deployment and triggers rollback
- **THEN** the system SHALL dispatch `POST /api/v1/projects/:id/rollback` with target environment and deployment ID.
