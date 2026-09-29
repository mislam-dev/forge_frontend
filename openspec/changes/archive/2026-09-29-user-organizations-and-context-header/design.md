# Design

## Context

The Forge frontend application supports both personal and organization-level workspaces. The Axum backend uses the HTTP request header `Organization-ID` to determine tenant boundaries for tenant-scoped resources (projects, teams, deployments, env vars). 

Previously:
- `Sidebar.tsx` contained an effect that forced `activeOrgId` to `orgs[0].id` whenever organizations were loaded, preventing users from staying in or returning to their personal profile.
- The switcher dropdown only showed organizations, omitting the user's personal profile.
- Users belonging to zero organizations were left in an awkward state if the code expected an organization to exist.
- The Axios HTTP request interceptor in `src/lib/api/client.ts` attached `Authorization` and `x-request-id` headers, but never sent `Organization-ID`.

## Goals / Non-Goals

**Goals:**
- Provide clear workspace context switching in the left sidebar between the user's personal profile and all member organizations.
- Default the active context to the user's personal profile (`activeOrgId: null`).
- Intercept all outgoing Axios HTTP requests and inject the `Organization-ID: <activeOrgId>` header when an organization is selected, omitting it when personal profile is active.
- Handle users who have no organizations gracefully without layout shifts or forced invalid selections.
- Provide a consistent UI in both expanded (`w-64`) and collapsed (`w-16`) sidebar states.

**Non-Goals:**
- Changing URL routing patterns (e.g. adding prefix `/:orgSlug/...`). Tenant context is communicated via headers.
- Modifying backend authentication or authorization business logic.

## Decisions

### 1. Workspace Store Structure & Nullable Context
- **Decision**: Represent personal workspace context as `activeOrgId: null` and `activeOrgName: null`.
- **Details**:
  - Update `useWorkspaceStore` action `setActiveOrgId` to accept `string | null`.
  - Add helper `setPersonalWorkspace()` (or allow passing `null`) to clear organization scoping.
- **Alternatives Considered**: Using a magic string like `'personal'` or `'__personal__'`. Rejected because `null` clearly distinguishes between absent organization ID and a valid UUID, directly aligning with header presence/absence.

### 2. Request Interceptor Header Injection
- **Decision**: In `src/lib/api/client.ts`, retrieve `activeOrgId` synchronously via `useWorkspaceStore.getState().activeOrgId` in the Axios request interceptor.
- **Details**:
  - If `activeOrgId` is truthy and non-empty, set `config.headers['Organization-ID'] = activeOrgId`.
  - If `activeOrgId` is null, undefined, or empty, ensure `delete config.headers['Organization-ID']` so no tenant header is dispatched.
- **Alternatives Considered**: Reading directly from `localStorage.getItem('forge-workspace')` and parsing JSON manually on each request. Zustand's `getState()` is already synchronized with memory and local storage, making it faster and cleaner.

### 3. Sidebar Workspace Switcher UI Architecture
- **Decision**: Restructure the sidebar dropdown into two clear logical sections:
  1. **Personal Workspace**: Shows user avatar / initials, user's full name or email (from `useUserProfile()`), and a badge/check if currently active.
  2. **Organizations**: Displays the list of organizations fetched from `useOrganizationsList()`.
- **Zero-Organization Handling**: If `orgs.length === 0`, show an informational empty state ("No organizations joined") with a button/link to "Create Organization".
- **Initial Context**: Remove the auto-select effect that forced `activeOrgId = orgs[0].id`. The store defaults to `null`, meaning personal profile is selected by default.
- **Stale Context Cleanup**: If a persisted `activeOrgId` is present in storage but does not match any organization in `orgs` once loaded, reset cleanly to personal workspace (`null`).

## Risks / Trade-offs

- **[Risk]** Stale queries cached under TanStack Query after switching organizations or switching to personal profile.
  - **Mitigation**: When switching active workspace in `Sidebar.tsx`, invalidate or reset relevant queries (or invalidate queries tagged with workspace data like `projects`, `teams`) so the UI immediately loads data for the newly selected context.
- **[Risk]** Hydration mismatch in Next.js App Router for persisted store values.
  - **Mitigation**: Use a simple client-side `mounted` state check or ensure fallback defaults are identical during initial render pass before Zustand rehydrates.
