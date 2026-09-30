# Tasks

## 1. DTO Type Definitions & API Client Hooks

- [x] 1.1 Update `src/lib/api/types.ts` to define `DeploymentSummaryItem`, `SystemDashboardResponse`, `UserDashboardResponse`, and `OrgDashboardResponse` matching Axum backend Rust structs, and verify types with `pnpm tsc --noEmit`.
- [x] 1.2 Update `src/lib/hooks/api/useDashboard.ts` to type `useSystemDashboard`, `useUserDashboard`, and `useOrgDashboard` with the new DTOs, endpoint routes (`/api/v1/dashboard`, `/api/v1/dashboard/user`, `/api/v1/dashboard/org/:org_id`), and graceful non-admin error handling.

## 2. Reusable Deployment Summary Component

- [x] 2.1 Create `src/components/dashboard/DeploymentSummaryTable.tsx` to render `DeploymentSummaryItem` records with status badges, branch/commit formatting, relative timestamps, project links, skeleton states, and empty states.

## 3. Unified Dashboard View on `/dashboard`

- [x] 3.1 Refactor `src/app/(dashboard)/dashboard/page.tsx` to conditionally render personal metrics (`UserDashboardResponse`) when in personal workspace or organization metrics (`OrgDashboardResponse`) when an organization is active, rendering recent items via `DeploymentSummaryTable`.
- [x] 3.2 Add the extra prominently labeled section on `/dashboard` ("System Administrator Platform Overview") rendering `SystemDashboardResponse` metrics and system health indicators when accessible.

## 4. End-to-End Build & Verification

- [x] 4.1 Run `pnpm tsc --noEmit` and `pnpm build` to verify clean TypeScript compilation and Next.js route bundling without errors.
