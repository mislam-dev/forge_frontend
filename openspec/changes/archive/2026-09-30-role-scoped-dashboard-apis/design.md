# Design: Role-Scoped Dashboard API Calling

## Context

On `/dashboard`, the page previously initiated queries to `useSystemDashboard()`, `useUserDashboard()`, and `useOrgDashboard()` concurrently on render. For users in personal workspaces (`activeOrgId === null`) or organization workspaces (`activeOrgId !== null`), calling `GET /api/v1/dashboard` produced unauthorized 403 Forbidden errors and unnecessary backend load.

To resolve this, API invocations must strictly follow workspace context and user role boundaries.

## Goals / Non-Goals

**Goals:**
- In personal workspace context (`activeOrgId === null`), trigger ONLY `GET /api/v1/dashboard/user`; suppress `GET /api/v1/dashboard` and `GET /api/v1/dashboard/org/{org_id}`.
- In organization workspace context (`activeOrgId !== null`), trigger ONLY `GET /api/v1/dashboard/org/{org_id}`; suppress `GET /api/v1/dashboard` and `GET /api/v1/dashboard/user`.
- Ensure `useOrgDashboard` specifically targets `/api/v1/dashboard/org/{org_id}`.
- Provide a robust role-checking hook (`useIsSystemAdmin`) using current user profile and assigned roles to safely identify system administrators.
- In `/dashboard`, only invoke `GET /api/v1/dashboard` if the user is confirmed to have system administrator privileges AND activates the system administration view.
- Non-admin users never trigger the system administrator API.

**Non-Goals:**
- Creating new page routes or altering existing workspace URLs.
- Modifying backend server logic or database schemas.

## Decisions

### 1. Granular Query `enabled` Preconditions
- **Decision**: Update `useUserDashboard`, `useOrgDashboard`, and `useSystemDashboard` in `src/lib/hooks/api/useDashboard.ts` to accept optional `enabled` flags:
  ```typescript
  export function useUserDashboard(options?: { enabled?: boolean }) { ... }
  export function useOrgDashboard(orgId?: string | null, options?: { enabled?: boolean }) { ... }
  export function useSystemDashboard(options?: { enabled?: boolean }) { ... }
  ```
- **Rationale**: TanStack Query's `enabled` property cleanly halts network requests at the source until explicit conditions are satisfied.

### 2. Organization Endpoint Path Standardization
- **Decision**: In `useOrgDashboard`, target strictly `/api/v1/dashboard/org/${orgId}` matching the documented Axum API route.
- **Rationale**: Removes unnecessary 404 fallback attempts and ensures predictable, clean network traffic.

### 3. System Administrator Role Detection (`useIsSystemAdmin`)
- **Decision**: Create a dedicated hook `useIsSystemAdmin()` that inspects:
  - `userProfile?.roles` (e.g., `'system_admin'`, `'admin'`, `'superuser'`)
  - Assigned roles from `useUserAssignedRoles(user?.id)` checking `role.name` or `role.is_system === true`.
- **Rationale**: Accurately determines authorization without guessing or blindly pinging protected endpoints.

### 4. Mode Selection on `/dashboard` for Administrators
- **Decision**: When `isSystemAdmin` is true, display a view toggle in the dashboard header:
  - **Workspace Overview** (Default): Renders active personal or org workspace metrics and calls only that workspace's API.
  - **System Administration**: Renders the global platform overview and calls `GET /api/v1/dashboard`.
  For non-admin users, this toggle is completely omitted and the system admin API is never invoked.

## Risks / Trade-offs

- **[Risk]** Asynchronous role check latency could briefly delay admin toggle rendering.
  - **Mitigation**: Default the view to the user's active workspace (personal or org), so standard workspace metrics render immediately without blocking.
