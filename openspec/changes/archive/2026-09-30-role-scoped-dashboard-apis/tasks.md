# Tasks

## 1. Dashboard Query Hooks Refactor

- [x] 1.1 Update `src/lib/hooks/api/useDashboard.ts` to accept an optional `{ enabled?: boolean }` options parameter for `useUserDashboard`, `useOrgDashboard`, and `useSystemDashboard`, and standardize the organization endpoint strictly to `/api/v1/dashboard/org/${orgId}` without 404 fallbacks.
- [x] 1.2 Create or export a `useIsSystemAdmin()` helper in `src/lib/hooks/api/useUserProfile.ts` to inspect user profile roles and assigned system roles.

## 2. Dashboard View & Conditional Query Scoping

- [x] 2.1 Refactor query execution in `src/app/(dashboard)/dashboard/page.tsx` so personal workspace (`activeOrgId === null`) runs ONLY `useUserDashboard` and completely suppresses `useSystemDashboard` and `useOrgDashboard`.
- [x] 2.2 Refactor query execution in `src/app/(dashboard)/dashboard/page.tsx` so organization workspace (`activeOrgId !== null`) runs ONLY `useOrgDashboard` and completely suppresses `useSystemDashboard` and `useUserDashboard`.
- [x] 2.3 Add a role-gated view toggle on `DashboardPage` for verified system administrators that enables `useSystemDashboard` only when the system administration view is active.

## 3. Verification & Type Checking

- [x] 3.1 Run `pnpm tsc --noEmit` and `pnpm build` to verify clean TypeScript compilation and build bundling without errors.
