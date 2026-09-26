# Tasks

## 1. Organization Member Role Management

- [x] 1.1 Add `UpdateOrgMemberRoleRequest` interface in `src/lib/api/types.ts`
- [x] 1.2 Implement `useUpdateOrgMemberRole` mutation hook in `src/lib/hooks/api/useOrganizations.ts`
- [x] 1.3 Implement `PATCH /api/v1/organizations/:id/members/:memberId` endpoint handler in `src/lib/api/mock/adapter.ts`
- [x] 1.4 In `src/app/(dashboard)/organizations/[id]/members/page.tsx`, replace the static role badge with an interactive role `<select>` selector (`Owner`, `Admin`, `Member`, `Viewer`)

## 2. Removal of All Organizations Page & Breadcrumbs

- [x] 2.1 Update `src/app/(dashboard)/organizations/page.tsx` to redirect visitors directly to `/organizations/${activeOrgId || 'org-1'}`
- [x] 2.2 Remove the "All Organizations" back button and breadcrumb link in `src/components/organizations/OrgHeader.tsx`
- [x] 2.3 Update the "Organizations" shortcut link in `src/app/(dashboard)/dashboard/page.tsx` to route to `/organizations/${activeOrgId || 'org-1'}`

## 3. Team Creation Parallel & Intercepted Route

- [x] 3.1 Extract team creation form into `src/components/teams/CreateTeamForm.tsx` with cancel and completion callbacks
- [x] 3.2 Create standalone team creation page at `src/app/(dashboard)/teams/new/page.tsx`
- [x] 3.3 Create intercepted modal route at `src/app/(dashboard)/@modal/(.)teams/new/page.tsx` using `<Dialog>` and `router.back()`
- [x] 3.4 Update `src/app/(dashboard)/teams/page.tsx` so the "New Team" button routes to `/teams/new`

## 4. Organization Creation Parallel & Intercepted Route

- [x] 4.1 Extract organization creation form into `src/components/organizations/CreateOrgForm.tsx` with cancel and completion callbacks
- [x] 4.2 Create standalone organization creation page at `src/app/(dashboard)/organizations/new/page.tsx`
- [x] 4.3 Create intercepted modal route at `src/app/(dashboard)/@modal/(.)organizations/new/page.tsx` using `<Dialog>` and `router.back()`
- [x] 4.4 Update "Create Organization" action in `src/components/layout/Sidebar.tsx` to route to `/organizations/new`

## 5. Verification & Build

- [x] 5.1 Run TypeScript type check (`npx tsc --noEmit`) and verify zero errors
- [x] 5.2 Run Next.js production build (`pnpm exec next build --webpack`) and verify build succeeds cleanly
