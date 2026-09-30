# Proposal: Role-Scoped Dashboard API Calling

## Why

Currently, `/dashboard` executes queries to multiple endpoints on page load, including an unconditional invocation of the system administrator API (`GET /api/v1/dashboard`). For standard users operating in personal or organization workspaces, this triggers unnecessary network traffic and 403 Forbidden errors. API invocations on the dashboard must be strictly scoped based on the user's role and the active workspace context: personal space must only call `/api/v1/dashboard/user`, organization space must only call `/api/v1/dashboard/org/{org_id}`, and the system administrator API must never be called during regular personal or organization workspace operations unless the user possesses the system administrator role and actively requests/views system administration metrics.

## What Changes

- **Strict Workspace & Role-Conditioned API Execution**:
  - In Personal Workspace (`activeOrgId === null`), only `GET /api/v1/dashboard/user` is executed; `GET /api/v1/dashboard` is disabled (`enabled: false`).
  - In Organization Workspace (`activeOrgId !== null`), only `GET /api/v1/dashboard/org/{org_id}` is executed; `GET /api/v1/dashboard` is disabled (`enabled: false`).
  - `GET /api/v1/dashboard` is only invoked when the authenticated user is confirmed to have the system administrator role and is actively viewing or switching to system administrator mode.
- **Dedicated Org Endpoint Standardization**:
  - Standardize the organization dashboard query in `useDashboard.ts` to strictly target `/api/v1/dashboard/org/{org_id}` without unnecessary or misleading fallbacks.
- **Role Detection for System Admin**:
  - Implement a role-checking mechanism (inspecting assigned roles or system admin status) to determine if system administrator actions/data are permissible before attempting any system-level API requests.
- **Dashboard UI Enhancements**:
  - Provide a clean role-aware view toggle or section on the dashboard for system administrators, ensuring personal and organization workspaces remain clean and isolated from admin API calls.

## Capabilities

### Modified Capabilities
- `domain-modules`: Update the `Overview Dashboard Metrics & System Health` requirement to mandate that personal and organization workspaces do not invoke the system administrator API, and that dashboard API requests are strictly conditioned on active workspace context and user role.

## Impact

- **Modified Files**:
  - `src/lib/hooks/api/useDashboard.ts`: Add `enabled` gating to `useSystemDashboard`, `useUserDashboard`, and `useOrgDashboard` so they only fire when their specific workspace context and role preconditions are met.
  - `src/app/(dashboard)/dashboard/page.tsx`: Condition query executions to ensure personal and organization spaces do not trigger system administrator endpoints.
  - `src/lib/hooks/api/useUserProfile.ts` / `useAccessControl.ts`: Expose helper/role verification for system admin status.
