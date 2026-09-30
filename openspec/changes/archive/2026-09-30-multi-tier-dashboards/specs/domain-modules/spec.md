# Spec Delta: domain-modules

## MODIFIED Requirements

### Requirement: Overview Dashboard Metrics & System Health
The system SHALL present an overview dashboard on route `/dashboard` dynamically rendering workspace-specific data and, for system administrators, displaying an extra platform overview section with a dedicated label, interacting with typed API responses:
1. **Personal Workspace Context (`activeOrgId === null`)**: Fetches `GET /api/v1/dashboard/user` returning `UserDashboardResponse` (`assigned_projects_count`, `deployments_triggered_count`, `org_memberships_count`, `recent_activity: DeploymentSummaryItem[]`).
2. **Organization Workspace Context (`activeOrgId !== null`)**: Fetches `GET /api/v1/dashboard/org/{org_id}` returning `OrgDashboardResponse` (`org_id`, `members_count`, `projects_count`, `teams_count`, `deployments_count`, `success_rate`, `active_deployments_count`, `recent_deployments: DeploymentSummaryItem[]`).
3. **System Administrator Section**: When the authenticated user has system administrator privileges or when `GET /api/v1/dashboard` is accessible, the dashboard SHALL render an extra prominently labeled section ("System Administration" / "Platform Overview") displaying `total_organizations`, `total_users`, `total_projects`, and `total_deployments` from `SystemDashboardResponse`, alongside system health probes (`/api/v1/health/live`, `/api/v1/health/ready`, `/api/v1/health/deep`).

#### Scenario: Dashboard loads aggregate metrics successfully
- **WHEN** an authenticated user navigates to `/dashboard`
- **THEN** the system SHALL load the appropriate workspace dashboard data based on `useWorkspaceStore` and display metric cards and a recent deployment activity stream with status badges.

#### Scenario: Personal workspace dashboard metrics rendering
- **WHEN** an authenticated user views `/dashboard` in personal workspace mode
- **THEN** the system SHALL display metric cards for assigned projects count, deployments triggered count, and organization memberships count, as well as a table of recent user activity conforming to `DeploymentSummaryItem`.

#### Scenario: Organization workspace dashboard metrics rendering
- **WHEN** an authenticated user views `/dashboard` with an active organization selected
- **THEN** the system SHALL display metric cards for organization members count, projects count, teams count, total deployments, success rate percentage, and active deployments count, as well as a table of recent organization deployments conforming to `DeploymentSummaryItem`.

#### Scenario: System Administrator extra data section with label
- **WHEN** a system administrator navigates to `/dashboard`
- **THEN** the system SHALL render an extra labeled section clearly designated with an administrative badge displaying total organizations, total users, total projects, and total deployments from `/api/v1/dashboard`.

#### Scenario: System health indicator reflects backend availability
- **WHEN** the backend health endpoint responds with operational status
- **THEN** the system SHALL render a green status indicator showing healthy services, or an alert badge when degraded.

#### Scenario: Recent deployment items formatting
- **WHEN** recent deployments or activities are rendered in `/dashboard`
- **THEN** each deployment row SHALL display the deployment ID, project ID / project link, branch, commit hash, creation timestamp, and a color-coded status badge conforming to `DeploymentSummaryItem`.
