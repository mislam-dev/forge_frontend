# Spec Delta

## MODIFIED Requirements

### Requirement: Overview Dashboard Metrics & System Health
The system SHALL present an overview dashboard on route `/dashboard` dynamically executing role-scoped and workspace-scoped API requests without superfluous network calls:
1. **Personal Workspace Context (`activeOrgId === null`)**: The system SHALL fetch ONLY `GET /api/v1/dashboard/user` returning `UserDashboardResponse` (`assigned_projects_count`, `deployments_triggered_count`, `org_memberships_count`, `recent_activity: DeploymentSummaryItem[]`). The system administrator endpoint `GET /api/v1/dashboard` SHALL NOT be called.
2. **Organization Workspace Context (`activeOrgId !== null`)**: The system SHALL fetch ONLY `GET /api/v1/dashboard/org/{org_id}` returning `OrgDashboardResponse` (`org_id`, `members_count`, `projects_count`, `teams_count`, `deployments_count`, `success_rate`, `active_deployments_count`, `recent_deployments: DeploymentSummaryItem[]`). The system administrator endpoint `GET /api/v1/dashboard` SHALL NOT be called.
3. **System Administrator View**: The system administrator API `GET /api/v1/dashboard` SHALL be invoked ONLY when the user is verified to have the system administrator role and has activated the system administrator view. When active, it displays `total_organizations`, `total_users`, `total_projects`, and `total_deployments` from `SystemDashboardResponse` within a clearly designated section alongside system health probes (`/api/v1/health/live`, `/api/v1/health/ready`, `/api/v1/health/deep`).

#### Scenario: Dashboard loads aggregate metrics successfully
- **WHEN** an authenticated user navigates to `/dashboard`
- **THEN** the system SHALL invoke only the API endpoint corresponding to the active workspace context and user role, suppressing unneeded endpoints and rendering the relevant metrics and deployment summaries.

#### Scenario: Personal workspace dashboard metrics rendering
- **WHEN** an authenticated user views `/dashboard` in personal workspace mode (`activeOrgId === null`)
- **THEN** the system SHALL invoke `GET /api/v1/dashboard/user` and SHALL NOT invoke `GET /api/v1/dashboard` or `/api/v1/dashboard/org/{org_id}`, displaying personal metric cards and a table of recent activity.

#### Scenario: Organization workspace dashboard metrics rendering
- **WHEN** an authenticated user views `/dashboard` with an active organization selected (`activeOrgId !== null`)
- **THEN** the system SHALL invoke `GET /api/v1/dashboard/org/{org_id}` and SHALL NOT invoke `GET /api/v1/dashboard` or `/api/v1/dashboard/user`, displaying organization metric cards and a table of recent organization deployments.

#### Scenario: System Administrator extra data section with label
- **WHEN** a user verified to possess the system administrator role accesses the system administrator view on `/dashboard`
- **THEN** the system SHALL invoke `GET /api/v1/dashboard` and render an extra labeled section designated with an administrative badge displaying total organizations, total users, total projects, and total deployments.

#### Scenario: System health indicator reflects backend availability
- **WHEN** the backend health probe responds with operational status (`status === 'healthy'` from liveness probe or `status === 'ready'` from readiness probe)
- **THEN** the system SHALL render an emerald status badge showing "Systems Operational", or render an alert badge when degraded or offline.

#### Scenario: Readiness probe reports degraded dependencies
- **WHEN** `/health/ready` returns HTTP 503 or `status === 'not_ready'` with one or more unhealthy dependency checks
- **THEN** the system health indicator SHALL transition to "Degraded Performance" or display offline status without triggering unhandled runtime exceptions.

#### Scenario: Deep health check report in Administrator View
- **WHEN** an authorized System Administrator activates the administrator view on `/dashboard`
- **THEN** the system SHALL query `/health/deep` (or `/api/v1/health/deep`) and render platform uptime, service version, environment details, and granular dependency health states.

#### Scenario: Recent deployment items formatting
- **WHEN** recent deployments or activities are rendered in `/dashboard`
- **THEN** each deployment row SHALL display the deployment ID, project ID / project link, branch, commit hash, creation timestamp, and a color-coded status badge conforming to `DeploymentSummaryItem`.
