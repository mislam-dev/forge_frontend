# Tasks

## 1. Consolidate Teams Management & Clean Up Organization Tabs

- [x] 1.1 Remove the Teams tab from `src/components/organizations/OrgHeader.tsx` and verify that only Overview and Members navigation links are rendered.
- [x] 1.2 Remove the Teams Preview card and Internal Teams metric card from `src/app/(dashboard)/organizations/[id]/page.tsx`, removing unused `useOrgTeams` query and rebalancing the metrics grid to 2 columns (Total Members, Workspace Tier).
- [x] 1.3 Replace the content of `src/app/(dashboard)/organizations/[id]/teams/page.tsx` with an immediate redirect to `/teams`, verifying that visiting `/organizations/[id]/teams` navigates to `/teams`.

## 2. Workspace Switching Logic & In-Page Isolation Guards

- [x] 2.1 Update workspace switching in `src/components/layout/Sidebar.tsx` to ensure that selecting a new organization from `/organizations/*` navigates to `/organizations/${targetOrgId}`, and selecting the personal workspace navigates to `/dashboard`.
- [x] 2.2 Implement workspace isolation guard in `src/app/(dashboard)/organizations/[id]/page.tsx`: after store hydration (`hasHydrated`), redirect to `/dashboard` if `activeOrgId === null`, and redirect to `/organizations/${activeOrgId}` if `activeOrgId !== orgId`.
- [x] 2.3 Implement workspace isolation guard in `src/app/(dashboard)/organizations/[id]/members/page.tsx`: after store hydration (`hasHydrated`), redirect to `/dashboard` if `activeOrgId === null`, and redirect to `/organizations/${activeOrgId}` if `activeOrgId !== orgId`.
- [x] 2.4 Update `src/components/layout/UserNav.tsx` to safely handle personal workspace mode when displaying or linking to "Manage Organization".

## 3. Verification & Type Checking

- [x] 3.1 Run TypeScript compiler (`npx tsc --noEmit` or build check) to verify zero compilation or typing regressions across updated components.
- [x] 3.2 Verify browser behavior when switching workspaces across personal profile and organizations while on `/organizations/[id]` and `/organizations/[id]/members`.
