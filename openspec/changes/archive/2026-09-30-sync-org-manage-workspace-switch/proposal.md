# Proposal

## Why

Currently, when navigating the Organization Manage pages (`/organizations/[id]`, `/organizations/[id]/members`), switching workspaces does not reliably update the view to match the active workspace context. If a user switches to another organization from the workspace switcher or directly changes their active workspace, the page continues showing the previous organization's data or stale records. If a user switches to their personal workspace, they remain stuck on an organization management page instead of redirecting to the personal dashboard. Furthermore, the Organization Manage page contains redundant "Teams" tabs and preview cards that duplicate the dedicated top-level Teams feature already integrated into the sidebar navigation.

## What Changes

- **Consolidate Team Management**: Remove the redundant "Teams" tab from `OrgHeader` and the "Teams Preview" card from `OrganizationDetailPage` (`/organizations/[id]`). Redirect any legacy or direct traffic from `/organizations/[id]/teams` to the centralized `/teams` page.
- **Organization Manage Workspace Switching**:
  - In `Sidebar.tsx`, when the active organization is switched while the user is on an organization route (`/organizations/*`), automatically redirect to the newly selected organization's overview page (`/organizations/${newOrg.id}`).
  - When switching to the personal workspace from any organization route, redirect immediately to `/dashboard`.
- **In-Page Workspace Isolation Guards**:
  - Add active workspace synchronization checks in `/organizations/[id]/page.tsx` and `/organizations/[id]/members/page.tsx` that evaluate after store hydration:
    - If `activeOrgId === null` (personal workspace), redirect to `/dashboard`.
    - If `activeOrgId !== null` and `activeOrgId !== orgId`, automatically redirect to `/organizations/${activeOrgId}`.

## Capabilities

### New Capabilities
*(None)*

### Modified Capabilities
- `domain-modules`: Update requirements for `Workspace Navigation & Organization Scope`, `Organizations and Tenant Management`, and `Global and Organization Teams Management` to specify workspace synchronization on organization manage routes (redirecting to `/organizations/${newOrgId}` on organization switch, redirecting to `/dashboard` on personal workspace switch), enforcing page-level route alignment when `activeOrgId !== params.id`, and deprecating/removing the redundant Teams tab and preview on organization manage views in favor of `/teams`.

## Impact

- `src/components/organizations/OrgHeader.tsx`: Remove the Teams navigation tab from `navLinks`.
- `src/app/(dashboard)/organizations/[id]/page.tsx`: Remove the Teams Preview card and internal teams metric; add workspace isolation guard with redirection to `/dashboard` or `/organizations/${activeOrgId}`.
- `src/app/(dashboard)/organizations/[id]/members/page.tsx`: Add workspace isolation guard with redirection to `/dashboard` or `/organizations/${activeOrgId}`.
- `src/app/(dashboard)/organizations/[id]/teams/page.tsx`: Update to redirect to `/teams`.
- `src/components/layout/Sidebar.tsx`: Ensure organization workspace switching redirects `/organizations/*` routes to `/organizations/${targetOrgId}` and personal workspace switching redirects to `/dashboard`.
