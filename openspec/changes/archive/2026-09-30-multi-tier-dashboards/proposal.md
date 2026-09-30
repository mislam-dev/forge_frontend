# Proposal: Multi-Tier Workspace Dashboards (Unified Single-Page View)

## Why

Forge previously presented a generic dashboard page (`/dashboard`) with mismatched mock-like metrics. To provide a seamless user experience without route fragmentation, the dashboard will remain on the single `/dashboard` route. It will dynamically present workspace-specific metrics (personal workspace vs. organization workspace) and, for system administrators, present an extra dedicated system-wide metrics section clearly labeled on the same page, consuming typed Serde DTOs from the Axum backend.

## What Changes

- **Update API DTO Contracts**:
  - Define `DeploymentSummaryItem` DTO (`id`, `project_id`, `branch`, `commit_hash`, `status`, `created_at`).
  - Align `SystemDashboardResponse` DTO (`total_organizations`, `total_users`, `total_projects`, `total_deployments`).
  - Align `UserDashboardResponse` DTO (`assigned_projects_count`, `deployments_triggered_count`, `org_memberships_count`, `recent_activity: DeploymentSummaryItem[]`).
  - Align `OrgDashboardResponse` DTO (`org_id`, `members_count`, `projects_count`, `teams_count`, `deployments_count`, `success_rate`, `active_deployments_count`, `recent_deployments: DeploymentSummaryItem[]`).
- **Update Dashboard API Hooks (`useDashboard.ts`)**:
  - Update `useSystemDashboard` to fetch `GET /api/v1/dashboard` returning `SystemDashboardResponse`.
  - Update `useUserDashboard` to fetch `GET /api/v1/dashboard/user` returning `UserDashboardResponse`.
  - Update `useOrgDashboard(orgId)` to fetch `GET /api/v1/dashboard/org/{org_id}` (with `/api/v1/dashboard/{org_id}` fallback) returning `OrgDashboardResponse`.
- **Unified Single-Page Dashboard (`/dashboard`)**:
  - Keep everything on `/dashboard`.
  - When in personal workspace (`activeOrgId === null`), display personal metrics (`assigned_projects_count`, `deployments_triggered_count`, `org_memberships_count`) and personal recent activity.
  - When in organization workspace (`activeOrgId !== null`), display organization metrics (`members_count`, `projects_count`, `teams_count`, `deployments_count`, `success_rate`, `active_deployments_count`) and organization recent deployments.
  - If the user is a system administrator, render an extra labeled section on the dashboard page ("System Administrator Overview") displaying platform-wide totals (`total_organizations`, `total_users`, `total_projects`, `total_deployments`) and system health probes.
- **Reusable Deployment Summary Component**:
  - Render recent deployments/activities using a reusable `DeploymentSummaryTable` component supporting `DeploymentSummaryItem`.

## Capabilities

### Modified Capabilities
- `domain-modules`: Update overview dashboard requirements to define unified single-page dashboard behavior on `/dashboard` that renders personal workspace metrics, organization workspace metrics, and extra labeled system administrator metrics.

## Impact

- **Modified Files**:
  - `src/lib/api/types.ts`: Update dashboard DTO interfaces.
  - `src/lib/hooks/api/useDashboard.ts`: Align query types and keys.
  - `src/app/(dashboard)/dashboard/page.tsx`: Unified workspace and system admin rendering on the single page.
  - `src/components/dashboard/DeploymentSummaryTable.tsx`: Reusable deployment summary table component.
