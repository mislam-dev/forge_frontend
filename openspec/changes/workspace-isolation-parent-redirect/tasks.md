# Tasks

## 1. Workspace Switcher Redirection

- [x] 1.1 In `src/components/layout/Sidebar.tsx`, import `useRouter` and implement route-aware redirection in `handleSelectPersonal` (redirecting to `/dashboard` when on projects, teams, or organizations) and `handleSelectOrg` (redirecting child routes to their parent `/projects` or `/teams`, or `/organizations/[id]`).
- [x] 1.2 In `src/components/layout/Sidebar.tsx`, ensure the stale workspace reset `useEffect` also redirects to `/dashboard` when falling back to personal workspace from projects, teams, or organizations.

## 2. Component-Level Workspace Isolation Guards

- [x] 2.1 In `src/components/projects/ProjectHeader.tsx`, add an isolation check against `activeOrgId` that redirects to `/dashboard` (if in personal workspace) or `/projects` (if in an organization workspace) if the loaded project belongs to a different organization.
- [x] 2.2 In `src/app/(dashboard)/teams/page.tsx` and `src/app/(dashboard)/teams/[id]/members/page.tsx`, add workspace isolation checks that redirect personal workspace users to `/dashboard` and mismatched team organizations to `/teams`.

## 3. Verification & Build

- [x] 3.1 Run TypeScript type check (`pnpm tsc --noEmit`) and verify clean compilation without errors.
- [x] 3.2 Run production build (`pnpm build`) and verify all pages build successfully.
