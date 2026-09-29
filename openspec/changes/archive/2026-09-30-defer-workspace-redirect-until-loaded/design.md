# Design

## Context

See proposal.md - Why.
In Next.js client components using Zustand's `persist`, components mount initially with default in-memory values (`activeOrgId: null`) before local storage hydration completes. Furthermore, queries such as `useTeamDetail(teamId)` take a short time to fetch data over the network. Evaluating workspace isolation checks synchronously on mount causes premature redirects to `/dashboard` on page refresh.

## Goals / Non-Goals

**Goals:**
- Provide a reactive `hasHydrated: boolean` property and setter in `useWorkspaceStore` via Zustand's `persist` `onRehydrateStorage` hook.
- Configure `partialize` in `useWorkspaceStore` to only persist UI state (`activeOrgId`, `activeOrgName`, `isSidebarCollapsed`), ensuring `hasHydrated` starts as `false` on initial mount / reload.
- Guard workspace isolation in `TeamMembersStandalonePage` (`src/app/(dashboard)/teams/[id]/members/page.tsx`): defer redirect until `hasHydrated && !isLoading`.
- Guard workspace isolation in `GlobalTeamsPage` (`src/app/(dashboard)/teams/page.tsx`): defer redirect until `hasHydrated`.
- Guard workspace isolation in `ProjectOverviewPage` (`src/app/(dashboard)/projects/[id]/page.tsx`) and `ProjectHeader` (`src/components/projects/ProjectHeader.tsx`): defer redirect until `hasHydrated && !isLoading`.
- Maintain immediate redirection upon explicit workspace switching via `Sidebar.tsx`.

**Non-Goals:**
- Altering the backend API endpoints or authorization tokens.
- Modifying routing paths or URL structures.

## Decisions

### 1. Store Hydration Tracking with `onRehydrateStorage`
In `src/lib/store/useWorkspaceStore.ts`:
```ts
export interface WorkspaceState {
  activeOrgId: string | null;
  activeOrgName: string | null;
  isSidebarCollapsed: boolean;
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  setActiveOrgId: (id: string | null) => void;
  setActiveOrgName: (name: string | null) => void;
  setPersonalWorkspace: () => void;
  setOrganizationWorkspace: (id: string, name: string) => void;
  toggleSidebar: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeOrgId: null,
      activeOrgName: null,
      isSidebarCollapsed: false,
      hasHydrated: false,
      setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
      setActiveOrgId: (id: string | null) => set({ activeOrgId: id }),
      setActiveOrgName: (name: string | null) => set({ activeOrgName: name }),
      setPersonalWorkspace: () => set({ activeOrgId: null, activeOrgName: null }),
      setOrganizationWorkspace: (id: string, name: string) => set({ activeOrgId: id, activeOrgName: name }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    }),
    {
      name: 'forge-workspace',
      partialize: (state) => ({
        activeOrgId: state.activeOrgId,
        activeOrgName: state.activeOrgName,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
```
- *Rationale*: Excluding `hasHydrated` from `partialize` guarantees it is initialized to `false` in memory on every hard reload and flips to `true` when rehydration completes.

### 2. Team Member Standalone Page Redirect Guard
In `src/app/(dashboard)/teams/[id]/members/page.tsx`:
```tsx
  const hasHydrated = useWorkspaceStore((state) => state.hasHydrated);
  const activeOrgId = useWorkspaceStore((state) => state.activeOrgId);
  const { data: team, isLoading, isError } = useTeamDetail(teamId);

  // Enforce workspace isolation only after hydration & resource loading are complete
  useEffect(() => {
    if (!hasHydrated || isLoading) return;

    if (activeOrgId === null) {
      router.replace('/dashboard');
    } else if (team) {
      const teamOrgId = team.organization_id || team.org_id;
      if (teamOrgId && teamOrgId !== activeOrgId) {
        router.replace('/teams');
      }
    }
  }, [hasHydrated, team, activeOrgId, isLoading, router]);
```
- *Rationale*: During page refresh, the user sees the existing loading skeleton until `hasHydrated` is true and `team` has been fetched. Once both are ready, `activeOrgId` matches the team's organization ID, keeping the user securely on the page.

### 3. Global Teams & Project Access Guarding
- In `src/app/(dashboard)/teams/page.tsx`:
  Only redirect personal workspace to `/dashboard` if `hasHydrated` is `true`.
- In `src/app/(dashboard)/projects/[id]/page.tsx` and `src/components/projects/ProjectHeader.tsx`:
  Only execute workspace isolation redirects when `hasHydrated && !isLoading && project`.

## Risks / Trade-offs

- [Risk] If hydration takes tens of milliseconds, user might see a brief loading skeleton.
  → *Mitigation*: The loading skeleton is already designed and rendered on initial fetch, providing a smooth user experience without sudden URL bounces.
