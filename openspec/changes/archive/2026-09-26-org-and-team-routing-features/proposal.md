# Proposal: Organization Role Management, URL Intercepted Creation Routes & IA Cleanups

## 1. Summary
Address remaining bugs and implement new features documented in `docs/bugs/overall.md` and `docs/bugs/organizations.md`:
1. **Parallel & Intercepted Routes for Creation**: Convert Team Creation (`/teams/new`) and Organization Creation (`/organizations/new`) to Next.js parallel and intercepting routes (`@modal/(.)teams/new` and `@modal/(.)organizations/new`), providing dedicated shareable URLs while displaying responsive overlay dialogs during in-app navigation.
2. **Organization Member Role Editing**: Add the ability to modify organization member roles (`Owner`, `Admin`, `Member`, `Viewer`) on `/organizations/[id]/members`, supported by API hooks and mock backend handlers.
3. **Remove All Organizations Page & Breadcrumb**: Eliminate the standalone "All Organizations" list page (`/organizations`), redirecting any legacy visits to the active organization context (`/organizations/[id]`), and remove the "All Organizations" back-link/breadcrumb from `OrgHeader` and the dashboard quick shortcut.

## 2. Motivation
- **URL & Navigation Consistency**: Project creation was successfully converted to Next.js parallel/intercepting routes (`/projects/new`). Extending this pattern to Team Creation and Organization Creation ensures consistent URL-driven modal experiences across the entire dashboard. Users can share direct creation links or reload without losing application state.
- **Role Governance**: Organization administrators need fine-grained control to upgrade or downgrade teammate permissions between Owner, Admin, Member, and Viewer directly from the Members management table.
- **Streamlined Organization IA**: In multi-tenant cloud platforms, users operate inside an active organization context rather than browsing a global directory of all organizations. Removing the redundant `/organizations` page and its back-link breadcrumb clarifies the workspace mental model.

## 3. Scope of Changes
- **Team Creation Route**:
  - Extract team creation form into `src/components/teams/CreateTeamForm.tsx`.
  - Create standalone page `src/app/(dashboard)/teams/new/page.tsx`.
  - Create intercepted modal route `src/app/(dashboard)/@modal/(.)teams/new/page.tsx`.
  - Update `src/app/(dashboard)/teams/page.tsx` "New Team" button to link to `/teams/new`.
- **Organization Creation Route**:
  - Extract organization creation form into `src/components/organizations/CreateOrgForm.tsx`.
  - Create standalone page `src/app/(dashboard)/organizations/new/page.tsx`.
  - Create intercepted modal route `src/app/(dashboard)/@modal/(.)organizations/new/page.tsx`.
  - Update `Sidebar.tsx` "Create Organization" action to link to `/organizations/new`.
- **Organization Member Role Management**:
  - Add `UpdateOrgMemberRoleRequest` type in `src/lib/api/types.ts`.
  - Implement `useUpdateOrgMemberRole` hook in `src/lib/hooks/api/useOrganizations.ts`.
  - Implement `PATCH /api/v1/organizations/:id/members/:memberId` in `src/lib/api/mock/adapter.ts`.
  - Replace static role badge with interactive role selector in `src/app/(dashboard)/organizations/[id]/members/page.tsx`.
- **Removal of All Organizations Directory & Breadcrumbs**:
  - Update `src/app/(dashboard)/organizations/page.tsx` to automatically redirect users to `/organizations/${activeOrgId || 'org-1'}` (or dashboard).
  - Remove the "All Organizations" back-link button in `src/components/organizations/OrgHeader.tsx`.
  - Update `src/app/(dashboard)/dashboard/page.tsx` shortcut from `/organizations` to the active organization `/organizations/${activeOrgId || 'org-1'}`.

## 4. Success Criteria
- Navigating to `/teams/new` within the app displays the team creation dialog over the current page while updating the browser URL. Hard refresh renders the standalone page.
- Navigating to `/organizations/new` within the app displays the organization creation dialog over the current page while updating the browser URL. Hard refresh renders the standalone page.
- Organization member roles can be updated via dropdown on `/organizations/[id]/members` with immediate cache invalidation and toast feedback.
- Accessing `/organizations` seamlessly redirects to the active organization; no broken links or "All Organizations" back breadcrumbs remain in `OrgHeader` or the dashboard.
- Zero TypeScript (`npx tsc --noEmit`) or Next.js build errors.
