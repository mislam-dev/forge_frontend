# Design: Multi-Tier Workspace Dashboards (Unified Single-Page View)

## Context

The backend Axum service provides three distinct Serde-serialized responses:
- `SystemDashboardResponse` on `GET /api/v1/dashboard`
- `UserDashboardResponse` on `GET /api/v1/dashboard/user`
- `OrgDashboardResponse` on `GET /api/v1/dashboard/org/{org_id}` (or `GET /api/v1/dashboard/{org_id}`)
- `DeploymentSummaryItem` embedded in both user and organization responses.

Rather than fragmenting navigation into multiple route paths, all metrics are presented on the single unified `/dashboard` route (`src/app/(dashboard)/dashboard/page.tsx`). The view dynamically shifts its primary metrics based on the active workspace in `useWorkspaceStore` (personal vs organization). For users with system administrator privileges, an extra labeled section is rendered on the same page showing platform-wide totals.

## Goals / Non-Goals

**Goals:**
- Define exact TypeScript type interfaces mirroring the Rust backend DTOs:
  - `DeploymentSummaryItem`
  - `SystemDashboardResponse`
  - `UserDashboardResponse`
  - `OrgDashboardResponse`
- Refactor TanStack Query hooks in `src/lib/hooks/api/useDashboard.ts` to fetch typed responses for system, user, and organization endpoints.
- Create a reusable `DeploymentSummaryTable` component (`src/components/dashboard/DeploymentSummaryTable.tsx`) rendering `DeploymentSummaryItem` items.
- Refactor `src/app/(dashboard)/dashboard/page.tsx` to:
  - Render personal metrics & recent activity when `activeOrgId === null`.
  - Render organization metrics & recent deployments when `activeOrgId !== null`.
  - If the user is a system administrator (detected via role or successful `useSystemDashboard` response), render an extra labeled section ("System Administration Overview") with platform-wide totals and system health probes.
- Keep navigation simple on `/dashboard`.

**Non-Goals:**
- Creating new route pages (such as `/dashboard/user` or `/dashboard/[org_id]`).
- Modifying backend Rust handler endpoints or database schemas.

## Decisions

### 1. Unified Single-Page Architecture
- **Decision**: Keep the dashboard at `/dashboard` instead of separate routes.
- **Rationale**: User explicitly requested single-page dashboard experience. When the user switches workspaces using the existing workspace switcher in the sidebar, the dashboard reactively updates to display the selected organization's metrics or personal metrics, without navigating away or breaking breadcrumbs.

### 2. DTO Type Definitions
- **Decision**: Define canonical TypeScript interfaces in `src/lib/api/types.ts`:
  ```typescript
  export interface DeploymentSummaryItem {
    id: string;
    project_id: string;
    branch: string;
    commit_hash: string;
    status: string;
    created_at: string;
  }

  export interface SystemDashboardResponse {
    total_organizations: number;
    total_users: number;
    total_projects: number;
    total_deployments: number;
  }

  export interface UserDashboardResponse {
    assigned_projects_count: number;
    deployments_triggered_count: number;
    org_memberships_count: number;
    recent_activity: DeploymentSummaryItem[];
  }

  export interface OrgDashboardResponse {
    org_id: string;
    members_count: number;
    projects_count: number;
    teams_count: number;
    deployments_count: number;
    success_rate: number;
    active_deployments_count: number;
    recent_deployments: DeploymentSummaryItem[];
  }
  ```

### 3. System Administrator Extra Section
- **Decision**: Query `useSystemDashboard` with `{ retry: false }`. If the query returns data (or user has system admin role), display an extra section on `/dashboard` titled **"System Administrator Platform Overview"** with an admin badge (e.g. `<Badge variant="outline"><ShieldCheck className="h-3 w-3 mr-1" /> System Administrator</Badge>`), showing the 4 system cards: Total Organizations, Total Users, Total Projects, Total Deployments.

### 4. Reusable `DeploymentSummaryTable` Component
- **Decision**: Extract `DeploymentSummaryTable` into `src/components/dashboard/DeploymentSummaryTable.tsx`.
- **Rationale**: Both user personal activity and organization deployments share the exact same `DeploymentSummaryItem` schema.

## Risks / Trade-offs

- **[Risk]** Non-admin users receiving 403 on `/api/v1/dashboard`:
  - **Mitigation**: Handle 403 gracefully in `useSystemDashboard` so no toast or disruptive error is displayed to non-admin users; the system admin section simply stays hidden.
