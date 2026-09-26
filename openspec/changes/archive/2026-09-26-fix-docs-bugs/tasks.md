# Tasks

## 1. Confirmation Dialog Primitives & Native Alert Replacement

- [x] 1.1 Implement accessible `<ConfirmDialog>` component in `src/components/shared/ConfirmDialog.tsx` using Radix Dialog with title, description, confirm (destructive), cancel, and loading spinner states
- [x] 1.2 Replace native `confirm()` in project deletion (`src/app/(dashboard)/projects/[id]/page.tsx`) with `<ConfirmDialog>`
- [x] 1.3 Replace native `confirm()` in project access revocation (`src/app/(dashboard)/projects/[id]/access/page.tsx`) with `<ConfirmDialog>`
- [x] 1.4 Replace native `confirm()` in team deletion (`src/app/(dashboard)/teams/page.tsx`) with `<ConfirmDialog>`
- [x] 1.5 Replace native `confirm()` in team member removal (`src/components/teams/TeamMembersDialog.tsx`) with `<ConfirmDialog>`

## 2. Next.js Parallel & Intercepting Routes for Creation

- [x] 2.1 Update `src/app/(dashboard)/layout.tsx` to accept and render a `{ modal }` slot alongside `{ children }`
- [x] 2.2 Add `src/app/(dashboard)/@modal/default.tsx` returning `null`
- [x] 2.3 Create `src/app/(dashboard)/@modal/(.)projects/new/page.tsx` rendering the project creation wizard within a responsive `<Dialog>` modal that dismisses via `router.back()`
- [x] 2.4 Verify direct access to `/projects/new` still renders the full standalone page without modal wrapping

## 3. Shell Navigation, Dashboard & Organization Management

- [x] 3.1 Remove "Organizations" from `navItems` in `src/components/layout/Sidebar.tsx`
- [x] 3.2 Add "Manage Organization" menu item in `src/components/layout/UserNav.tsx` routing to the active organization (`/organizations/${activeOrgId}`)
- [x] 3.3 Update "Create Organization" action in `Sidebar.tsx` dropdown to trigger an organization creation modal/dialog
- [x] 3.4 Remove the "Organizations / Workspaces" metric card from `src/app/(dashboard)/dashboard/page.tsx`
- [x] 3.5 Add `useRemoveOrgMember` hook in `src/lib/hooks/api/useOrganizations.ts` and handle `DELETE /api/v1/organizations/:id/members/:memberId` in `src/lib/api/mock/adapter.ts`
- [x] 3.6 Add an "Action" column with a "Remove" button and confirmation dialog in `src/app/(dashboard)/organizations/[id]/members/page.tsx`

## 4. Project Management: Secrets, In-Place Env Vars & Git URL Validation

- [x] 4.1 Add password eye visibility toggle (`Eye` / `EyeOff`) to the environment variable input rows in Step 3 of `src/app/(dashboard)/projects/new/page.tsx`
- [x] 4.2 Update `src/app/(dashboard)/projects/[id]/env-vars/page.tsx` so existing environment variable values can be directly edited with secret toggle and copy buttons
- [x] 4.3 Add a Git URL validation section and "Validate URL" action with syntax checks and connection status badges in `src/app/(dashboard)/projects/[id]/repository/page.tsx`

## 5. Team Management: Role Editing & Mock API Support

- [x] 5.1 Add `UpdateTeamMemberRoleRequest` in `src/lib/api/types.ts` and `useUpdateTeamMemberRole` hook in `src/lib/hooks/api/useTeams.ts`
- [x] 5.2 Implement `PATCH /api/v1/teams/:id/members/:memberId` mock endpoint handler in `src/lib/api/mock/adapter.ts`
- [x] 5.3 In `src/components/teams/TeamMembersDialog.tsx`, replace static role badges with an interactive role selector allowing role changes (`Lead`, `Maintainer`, `Member`, `Viewer`)

## 6. Notification Center & Dedicated Settings IA

- [x] 6.1 Extend `NotificationDTO` with `category` and seed categories (`deployment`, `security`, `team`, `system`) in `src/lib/api/types.ts` and `src/lib/api/mock/seeds.ts`
- [x] 6.2 Overhaul `src/app/(dashboard)/notifications/page.tsx` with dedicated dropdown filters for Category and Severity
- [x] 6.3 Restructure `src/app/(dashboard)/settings/page.tsx` into a dedicated settings dashboard overview hub with categorized navigation cards for Profile Information, Security & Sessions, and Preferences

## 7. Verification & Build

- [x] 7.1 Run TypeScript type check (`npx tsc --noEmit`) and verify zero errors
- [x] 7.2 Run Next.js production build (`pnpm exec next build --webpack`) and verify build succeeds cleanly
