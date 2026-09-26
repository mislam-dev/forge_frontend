# Design: Organization Role Management, URL Intercepted Creation Routes & IA Cleanups

## Context
Following the initial bug fixes and features implemented in `2026-09-26-fix-docs-bugs`, this change completes the remaining items noted in `docs/bugs/`:
1. Next.js parallel and intercepting routes for both Team Creation and Organization Creation.
2. Direct editing of organization-level user roles in `/organizations/[id]/members`.
3. Removal of the legacy "All Organizations" directory page and breadcrumb back-links.

## Goals / Non-Goals

### Goals
- Uniform URL experience: Every creation flow (`/projects/new`, `/teams/new`, `/organizations/new`) uses Next.js App Router intercepting routes (`@modal/(.)*`) for in-context modals with standalone page fallbacks.
- Organization member role mutations supported end-to-end via TypeScript DTOs, React Query mutations, and mock API endpoints.
- Single-organization workspace mental model: Users are routed directly to their active organization context without any intermediate "All Organizations" page or breadcrumbs.

### Non-Goals
- Modifying backend Rust microservices or database schemas directly; all mock data and endpoints are simulated via Axios mock adapter.
- Changing team member role logic (already completed in previous change).

## Architectural Decisions

### Decision 1: Team Creation via `@modal/(.)teams/new`
- **Component Architecture**:
  - Extract the form logic from `src/app/(dashboard)/teams/page.tsx` into a reusable `CreateTeamForm` component in `src/components/teams/CreateTeamForm.tsx`.
  - Create `src/app/(dashboard)/teams/new/page.tsx` rendering `CreateTeamForm` within a standard dashboard container for direct visits.
  - Create `src/app/(dashboard)/@modal/(.)teams/new/page.tsx` wrapping `CreateTeamForm` in an accessible `<Dialog>` that dismisses via `router.back()` on completion or cancel.
  - Replace the local `dialogOpen` state in `src/app/(dashboard)/teams/page.tsx` with a `<Link href="/teams/new">` wrapping the "New Team" button.

### Decision 2: Organization Creation via `@modal/(.)organizations/new`
- **Component Architecture**:
  - Extract the organization form logic into `src/components/organizations/CreateOrgForm.tsx`.
  - Create `src/app/(dashboard)/organizations/new/page.tsx` rendering `CreateOrgForm` for direct visits.
  - Create `src/app/(dashboard)/@modal/(.)organizations/new/page.tsx` wrapping `CreateOrgForm` in a `<Dialog>` that dismisses via `router.back()`.
  - In `Sidebar.tsx`, update the workspace switcher's "Create Organization" menu item to navigate to `/organizations/new`.

### Decision 3: Organization Member Role Mutations
- **Approach**:
  - In `src/lib/api/types.ts`, define `UpdateOrgMemberRoleRequest`:
    ```ts
    export interface UpdateOrgMemberRoleRequest {
      role: 'Owner' | 'Admin' | 'Member' | 'Viewer' | string;
    }
    ```
  - In `src/lib/hooks/api/useOrganizations.ts`, implement `useUpdateOrgMemberRole(orgId: string)` which calls `PATCH /api/v1/organizations/:id/members/:memberId` and invalidates `['org-members', orgId]`.
  - In `src/lib/api/mock/adapter.ts`, intercept `PATCH /api/v1/organizations/:id/members/:memberId`, find the member in `orgMembersStore[orgId]`, update their role, and return the modified `OrgMemberDTO`.
  - In `src/app/(dashboard)/organizations/[id]/members/page.tsx`, replace the static `<Badge>` with an interactive `<select>` dropdown (`Owner`, `Admin`, `Member`, `Viewer`) with loading states and mutation handling.

### Decision 4: Elimination of All Organizations Directory & Breadcrumbs
- **Approach**:
  - In `src/app/(dashboard)/organizations/page.tsx`, replace the organization directory grid with an automatic client redirect to `/organizations/${activeOrgId || 'org-1'}` using `router.replace()`.
  - In `src/components/organizations/OrgHeader.tsx`, remove the `<Button><Link href="/organizations"><ArrowLeft /> All Organizations</Link></Button>` button element.
  - In `src/app/(dashboard)/dashboard/page.tsx`, update the shortcut button to route directly to `/organizations/${activeOrgId || 'org-1'}`.

## Risks & Mitigations
- **[Risk] Intercepting Route Modal Backstack**:
  - *Mitigation*: Ensure `@modal/(.)*` pages call `router.back()` on close so that browser history is maintained cleanly without orphaned modal slots.
- **[Risk] Mock Store Inconsistency**:
  - *Mitigation*: Ensure `PATCH /api/v1/organizations/:id/members/:memberId` mutates the active in-memory `orgMembersStore` array so subsequent queries return the updated role immediately.
