# Design

## Context

The Forge frontend uses Zustand (`useWorkspaceStore`) to track `activeOrgId`, which is persisted in localStorage. When users switch workspaces via the sidebar dropdown, `navigateForWorkspaceSwitch` handles cross-context routing. Previously, workspace isolation was implemented for projects (`/projects/[id]/*`) and teams (`/teams/[id]/*`), but the organization detail and management routes (`/organizations/[id]`, `/organizations/[id]/members`, etc.) lacked in-page workspace alignment guards. Furthermore, the organization management view had a legacy "Teams" tab and "Teams Preview" card, which duplicated functionality already present in the dedicated sidebar `/teams` section.

## Goals / Non-Goals

**Goals:**
- Consolidate all team management functionality exclusively under `/teams` by removing the "Teams" tab and "Teams Preview" card from the organization management views (`/organizations/[id]`).
- Redirect legacy `/organizations/[id]/teams` route traffic to `/teams`.
- Synchronize organization management views (`/organizations/[id]`, `/organizations/[id]/members`) with the active workspace context:
  - When switching organizations in the workspace dropdown, immediately navigate to the new organization's overview page (`/organizations/${newOrgId}`).
  - When switching to the personal profile workspace (`activeOrgId === null`), immediately redirect to `/dashboard`.
- Enforce in-page route isolation: if a user directly loads or holds an organization URL whose `orgId` param does not match `activeOrgId`, redirect them to `/dashboard` (if personal workspace is active) or to `/organizations/${activeOrgId}` (if an organization workspace is active), waiting until store hydration completes.

**Non-Goals:**
- Modifying backend Axum organization or team APIs.
- Changing member role mutation logic or organization creation flows.
- Preserving sub-tab paths (such as `/members`) across organization switching; as decided, organization switching while on organization pages always lands on the target organization's overview page.

## Decisions

### Decision 1: Organization Workspace Switch Destination
- **Choice**: Always navigate to `/organizations/${targetOrgId}` (overview) when switching to another organization from an organization page.
- **Rationale**: Confirmed by requirements and user clarification. The target organization may have different member rosters or configuration states; resetting to the overview root ensures clean state transitions and avoids confusing deep sub-tab state.
- **Alternatives Considered**:
  - Preserve sub-tab (e.g. `/organizations/org-1/members` -> `/organizations/org-2/members`). Rejected as per user decision.

### Decision 2: In-Page Route Alignment Effect
- **Choice**: Implement an `useEffect` check in `/organizations/[id]/page.tsx` and `/organizations/[id]/members/page.tsx` driven by `hasHydrated` and `activeOrgId`.
  ```ts
  useEffect(() => {
    if (!hasHydrated) return;
    if (activeOrgId === null) {
      router.replace('/dashboard');
    } else if (activeOrgId !== orgId) {
      router.replace(`/organizations/${activeOrgId}`);
    }
  }, [hasHydrated, activeOrgId, orgId, router]);
  ```
- **Rationale**: Prevents users from inspecting a mismatched organization if `activeOrgId` changes outside of sidebar navigation, on page refresh, or via browser history.
- **Alternatives Considered**:
  - Middleware-based route rewriting: Next.js middleware does not have access to client-side localStorage where Zustand persists the workspace selection. Client-side hydration-guarded redirection matches existing patterns in `teams/page.tsx` and `projects/page.tsx`.

### Decision 3: Removal of Teams Tab and Preview
- **Choice**:
  - In `OrgHeader.tsx`: Remove the Teams link from `navLinks`.
  - In `OrganizationDetailPage` (`/organizations/[id]/page.tsx`): Remove the `Teams Preview` card and `Internal Teams` metric card, rebalancing the metrics grid to 2 columns (Total Members, Workspace Tier). Remove `useOrgTeams` query call.
  - In `/organizations/[id]/teams/page.tsx`: Replace the content with a redirect to `/teams`.
- **Rationale**: The user clarified that the team feature is already fully integrated on the left sidebar, making the nested team tab on the organization page redundant. Centralizing teams at `/teams` eliminates duplicate management screens.

### Decision 4: UserNav Organization Link Hygiene
- **Choice**: Ensure `UserNav.tsx` conditionally hides or disables the "Manage Organization" menu item when `activeOrgId === null`, or navigates to `/dashboard` if personal.
- **Rationale**: When in personal workspace, there is no active organization to manage; directing to `/organizations/org-1` would conflict with workspace isolation and immediately bounce the user back.

## Risks / Trade-offs

- **[Risk] Hydration race condition causes flash of redirect**:
  - *Mitigation*:Redirection logic checks `hasHydrated` first and renders skeleton loaders while store hydration or initial organization data resolution is pending.
- **[Risk] Bookmarked legacy links to `/organizations/[id]/teams` break**:
  - *Mitigation*: The `/organizations/[id]/teams/page.tsx` route will redirect immediately to `/teams` rather than returning a 404.
