# Proposal

## Why

When a user reloads a scoped page such as the team member view page (`/teams/[id]/members`) or teams directory (`/teams`), the client component mounts with the initial in-memory state of `useWorkspaceStore` (`activeOrgId: null`) before local storage hydration finishes and before the team detail query resolves. As a result, route isolation effects prematurely evaluate `activeOrgId === null` and immediately redirect the user to `/dashboard`. Deferring route isolation checks on page reloads until application hydration and entity loading are complete prevents unwanted redirects while preserving the immediate isolation rules when a user explicitly switches workspaces.

## What Changes

- Add reactive hydration tracking (`hasHydrated`) to `useWorkspaceStore` via Zustand's `persist` middleware (`onRehydrateStorage`).
- Update `TeamMembersStandalonePage` (`/teams/[id]/members`) to wait until `hasHydrated` is true and `!isLoading` before evaluating workspace isolation and redirecting.
- Update `GlobalTeamsPage` (`/teams`) to defer redirecting until `hasHydrated` is true.
- Update project overview and project header isolation checks to ensure `hasHydrated` is verified before evaluating workspace isolation redirects.
- Preserve existing immediate workspace switching and redirection rules in `Sidebar.tsx` when a user actively changes workspaces.

## Capabilities

### Modified Capabilities
- `domain-modules`: Update `Requirement: Workspace Navigation & Organization Scope` to mandate that workspace isolation checks during page reloads and initial loads SHALL wait until store hydration and resource queries complete before executing any redirection.

## Impact

- `src/lib/store/useWorkspaceStore.ts`: Add `hasHydrated: boolean` and `setHasHydrated` state, with `onRehydrateStorage` callback and `partialize` configuration.
- `src/app/(dashboard)/teams/[id]/members/page.tsx`: Check `hasHydrated && !isLoading` before executing workspace isolation redirect.
- `src/app/(dashboard)/teams/page.tsx`: Check `hasHydrated` before redirecting personal workspaces.
- `src/app/(dashboard)/projects/[id]/page.tsx`: Verify `hasHydrated` before evaluating project workspace isolation.
- `src/components/projects/ProjectHeader.tsx`: Verify `hasHydrated` before evaluating project workspace isolation.
