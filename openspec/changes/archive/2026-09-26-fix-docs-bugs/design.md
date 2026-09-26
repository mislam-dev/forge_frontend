# Design

## Context

The audit of issues listed in `docs/bugs/` identified functional and UX enhancements across six core areas:
- **Confirmation dialogs**: Replace `window.confirm` with accessible Radix-based `<ConfirmDialog>`.
- **Creation routing**: Support Next.js parallel and intercepting routes (`@modal/(.)projects/new`) so creation can be opened as an in-context modal on soft navigation while remaining a standalone page on direct navigation.
- **Organizations**: Remove redundant sidebar link, add "Manage Organization" to user profile menu, open creation form directly from sidebar dropdown, remove dashboard workspace card, and add direct member removal.
- **Projects**: Secret visibility toggle in creation wizard, in-place editing of env var values, git URL syntax and connection validation, and confirmation dialog for deletion.
- **Teams**: Member role editing via selector dropdown and confirmation dialog for member removal.
- **Notifications & Settings**: Multi-category notification filter dropdowns and a dedicated settings hub.

## Goals / Non-Goals

**Goals:**
- Implement a reusable `<ConfirmDialog>` component in `src/components/ui/alert-dialog.tsx` or `src/components/shared/ConfirmDialog.tsx` replacing all native `window.confirm` calls.
- Add Next.js App Router parallel route slot `@modal` with `default.tsx` in `src/app/(dashboard)` and intercepted modal route for `/projects/new`.
- Update `Sidebar.tsx`, `UserNav.tsx`, and `dashboard/page.tsx` for cleaner workspace navigation.
- Add `useRemoveOrgMember` and `useUpdateTeamMemberRole` hooks with supporting mock adapter endpoints.
- Enhance project wizard step 3 with secret eye toggles, make project env vars directly editable in `projects/[id]/env-vars`, and add Git URL validation in `projects/[id]/repository`.
- Enhance notifications with category filtering and dropdown controls.
- Transform `/settings` into a dedicated settings dashboard.

**Non-Goals:**
- Modifying backend Rust services (all updates are client-side and simulated within `mock/adapter.ts` for offline/demo operation).
- Heavy third-party form wizard refactors (retaining existing React Hook Form + Zod patterns).

## Decisions

### Decision 1: Radix-Based `<ConfirmDialog>` Component
- **Approach**: Build `<ConfirmDialog>` on top of `@radix-ui/react-dialog` (or create `src/components/ui/alert-dialog.tsx` wrapping the existing Radix primitives) with props: `isOpen`, `onOpenChange`, `title`, `description`, `confirmText`, `cancelText`, `variant: 'destructive' | 'default'`, `isLoading`, and `onConfirm`.
- **Rationale**: Radix UI dialog is already installed in `package.json`, provides WAI-ARIA accessibility, focus trap, and portal rendering matching the current design tokens.

### Decision 2: Parallel & Intercepting Route Architecture for Creation Flows
- **Approach**:
  - In `src/app/(dashboard)/layout.tsx`, accept `{ children, modal }: { children: React.ReactNode; modal: React.ReactNode }`.
  - Add `src/app/(dashboard)/@modal/default.tsx` returning `null`.
  - Add `src/app/(dashboard)/@modal/(.)projects/new/page.tsx` rendering the creation wizard inside an accessible `<Dialog>`. When closed or cancelled, `router.back()` restores the underlying dashboard state.
  - Retain `src/app/(dashboard)/projects/new/page.tsx` for direct URL access, bookmarks, or full-page navigation.
- **Rationale**: Delivers the best of both worlds: smooth in-context modal creation without losing page background, alongside full deep linkability and browser history management.

### Decision 3: In-Place Editable Environment Variables
- **Approach**: In `projects/[id]/env-vars/page.tsx`, replace the static read-only `<EncryptedValueMasker>` span with an editable input field with an eye icon toggle button (`Eye`/`EyeOff`), copy button, and change listener.
- **Rationale**: Allows users to immediately view and edit existing secret values without having to delete and re-add variables.

### Decision 4: Git URL Validation Section
- **Approach**: In `projects/[id]/repository/page.tsx`, introduce a "Test Connection & Validate" section with a "Validate URL" button that validates Git URL format via regex and executes a simulated connection check, updating a status badge (`Valid & Reachable`, `Invalid Syntax`, or `Auth Token Required`).
- **Rationale**: Gives users immediate confidence that their repository URL and PAT credentials are properly formatted before triggering builds.

### Decision 5: Team and Organization Member Mutations
- **Approach**:
  - Implement `useRemoveOrgMember(orgId)` in `useOrganizations.ts` and handle `DELETE /api/v1/organizations/:id/members/:memberId` in `mock/adapter.ts`.
  - Implement `useUpdateTeamMemberRole(teamId)` in `useTeams.ts` and handle `PATCH /api/v1/teams/:id/members/:memberId` in `mock/adapter.ts`.
  - In `TeamMembersDialog.tsx`, replace static role badges with a `<select>` or `<DropdownMenu>` containing `Lead`, `Maintainer`, `Member`, and `Viewer`.

### Decision 6: Notification Filtering & Settings Hub
- **Approach**:
  - Extend `NotificationDTO` with `category: 'deployment' | 'security' | 'team' | 'system'`.
  - In `notifications/page.tsx`, add category selection dropdown alongside severity selection.
  - In `settings/page.tsx`, restructure `/settings` into an overview hub with summary cards linking to Profile (`/settings/profile`), Security (`/settings/security`), and Preferences.

## Risks / Trade-offs

- **[Risk] Next.js 16 Parallel Routes State**:
  - *Mitigation*: Ensure `@modal/default.tsx` returns `null` and dismissing intercepted routes invokes `router.back()` to prevent empty modal overlays on client transitions.
- **[Risk] Mock Adapter Synchronization**:
  - *Mitigation*: Update all in-memory mock stores (`orgMembersStore`, `teamMembersStore`, `notificationsStore`) so UI state changes persist across route navigations during offline testing.
