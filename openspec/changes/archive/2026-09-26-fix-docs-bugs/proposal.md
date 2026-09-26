# Proposal

## Why

During testing and code review across the Forge Frontend application, a series of functional bugs, missing interactions, and UX regressions were documented in `docs/bugs/` across six focus areas:
1. `overall.md`: Destructive confirmations use native browser alerts (`window.confirm`) instead of accessible design system modals; entity creation and editing workflows lack dedicated page URLs with Next.js parallel and intercepting route modals.
2. `organizations.md`: Administrators cannot directly remove organization members; the sidebar clutters primary navigation with an Organizations link rather than placing "Manage Organization" in the user profile menu; the sidebar org dropdown "Create Organization" action fails to open a creation form; and the dashboard overview displays an extraneous "Organizations" workspace card.
3. `notifications.md`: Notifications only filter on status/severity without distinction across notification categories (e.g., deployments, security, teams, system), and filter UX relies on horizontal button overflow rather than structured dropdowns.
4. `settings.md`: `/settings` routes directly to user profile fields instead of providing a dedicated settings overview hub for account preferences, security, and workspaces.
5. `project.md`: Project creation environment inputs lack an eye toggle to show or hide entered secrets; project deletion and project team access revocation invoke native browser alerts; project environment variable values cannot be edited in place; and Git repository settings lack a validation section to check URL syntax and connection reachability.
6. `teams.md`: Team administrators cannot modify assigned team member roles (Lead, Maintainer, Member, Viewer).

Addressing these issues resolves all open bug trackers in `docs/bugs/`, brings confirmation and navigation patterns into compliance with shadcn/ui guidelines, and improves workspace usability.

## What Changes

- **UI Components & Dialogs**:
  - Implement a reusable `<AlertDialog>` component (or `<ConfirmDialog>`) based on Radix UI dialog primitives with title, description, destructive confirm button, and cancel action.
  - Replace all native `confirm(...)` invocations in `projects/[id]/page.tsx`, `projects/[id]/access/page.tsx`, `teams/page.tsx`, and `TeamMembersDialog.tsx` with `<ConfirmDialog>`.
- **Navigation & Routing**:
  - Implement Next.js intercepting and parallel routing (`@modal` slot in `(dashboard)/layout.tsx`) for `/projects/new` and creation flows, enabling modal presentation on client navigation while retaining deep linkability and standalone page presentation on direct access/refresh.
  - Remove "Organizations" from the primary sidebar navigation (`navItems` in `Sidebar.tsx`).
  - Add "Manage Organization" to `UserNav.tsx` linking directly to `/organizations/${activeOrgId || 'org-1'}`.
  - Update the sidebar organization switcher dropdown so "Create Organization" launches an organization creation dialog.
  - Remove the "Organizations / Workspaces" metric card from `src/app/(dashboard)/dashboard/page.tsx`.
- **Project & Environment Management**:
  - In `projects/new/page.tsx`, add an eye icon toggle button (`Eye` / `EyeOff`) to show or hide the secret value for each environment variable row.
  - In `projects/[id]/env-vars/page.tsx`, replace the static read-only `EncryptedValueMasker` display with an inline editable input or edit modal allowing developers to update secret values directly.
  - In `projects/[id]/repository/page.tsx`, add a "Validate Git URL" section with format validation and simulated or remote reachability checking.
- **Team & Organization Member Management**:
  - In `useOrganizations.ts` and `mock/adapter.ts`, add `useRemoveOrgMember` mutation and `DELETE /api/v1/organizations/:id/members/:memberId` endpoint.
  - In `src/app/(dashboard)/organizations/[id]/members/page.tsx`, add an "Action" column with a remove member button and confirmation dialog.
  - In `useTeams.ts` and `mock/adapter.ts`, add `useUpdateTeamMemberRole` mutation and `PATCH /api/v1/teams/:id/members/:memberId` endpoint.
  - In `TeamMembersDialog.tsx`, replace static role badges with an interactive role selector dropdown allowing role changes.
- **Notification Center & Settings IA**:
  - Update `NotificationDTO` with `category` (`deployment`, `security`, `team`, `system`).
  - Overhaul `notifications/page.tsx` with dedicated dropdown filters for Category and Severity/Status.
  - Refactor `/settings` into a dedicated Settings hub with categorized preference cards and tabs (Profile, Security, Preferences).

## Capabilities

### New Capabilities
- `ui-components`: Accessible `<ConfirmDialog>` component providing asynchronous, promise-based or controlled dialog confirmations for destructive actions.
- `auth-routing`: Parallel and intercepting route slot (`@modal`) in `(dashboard)` layout supporting modal creation views with browser history parity.

### Modified Capabilities
- `dashboard-shell`: Sidebar navigation without top-level Organizations link; UserNav with "Manage Organization"; Sidebar Org switcher with direct creation trigger; Dashboard metric cards streamlined to three operational indicators.
- `domain-modules`: Organization member removal; Team member role updating; Project environment secret reveal toggles and in-place secret editing; Git URL validation; Multi-category notification filters; Dedicated settings hub.

## Impact

- **Affected Code**:
  - `src/components/ui/alert-dialog.tsx` (new) or `src/components/shared/ConfirmDialog.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/UserNav.tsx`
  - `src/app/(dashboard)/layout.tsx`
  - `src/app/(dashboard)/@modal/(.)projects/new/page.tsx` (new parallel/intercepting modal)
  - `src/app/(dashboard)/dashboard/page.tsx`
  - `src/app/(dashboard)/organizations/[id]/members/page.tsx`
  - `src/app/(dashboard)/projects/new/page.tsx`
  - `src/app/(dashboard)/projects/[id]/page.tsx`
  - `src/app/(dashboard)/projects/[id]/access/page.tsx`
  - `src/app/(dashboard)/projects/[id]/env-vars/page.tsx`
  - `src/app/(dashboard)/projects/[id]/repository/page.tsx`
  - `src/app/(dashboard)/teams/page.tsx`
  - `src/components/teams/TeamMembersDialog.tsx`
  - `src/app/(dashboard)/notifications/page.tsx`
  - `src/app/(dashboard)/settings/page.tsx`
  - `src/lib/api/types.ts`
  - `src/lib/hooks/api/useOrganizations.ts`
  - `src/lib/hooks/api/useTeams.ts`
  - `src/lib/api/mock/adapter.ts`
  - `src/lib/api/mock/seeds.ts`
- **Dependencies & APIs**: No external runtime additions required; uses existing `@radix-ui/react-dialog`, `@tanstack/react-query`, and Lucide icons.
