# Design

## Context

The Next.js App Router in `src/app/(dashboard)` employs parallel and intercepting routes via `@modal` (rendered as `{modal}` in `src/app/(dashboard)/layout.tsx`). Currently, `/teams/new`, `/organizations/new`, and `/projects/new` all use this pattern.

Team member management is currently contained inside `TeamMembersDialog.tsx` and invoked via local state `managingTeam` on the teams directory page. This prevents direct linking, deep linking, and browser navigation for team rosters.

## Goals / Non-Goals

**Goals:**
- Provide a dedicated URL route `/teams/[id]/members` for managing team rosters.
- Support parallel and intercepting routes (`@modal/(.)teams/[id]/members/page.tsx`) so clicking "Members" opens a responsive modal dialog over the active page.
- Support direct URL visits and hard refreshes (`teams/[id]/members/page.tsx`) rendering a dedicated standalone page with back navigation and team metadata.
- Export `useTeamDetail` hook from `useTeams.ts` to fetch team metadata (`GET /api/v1/teams/:id`).
- Extract the core member management interface into a shared `TeamMembersManager` component used by both the modal and full page.
- Update `/teams` and `/organizations/[id]/teams` directory cards to navigate to `/teams/${team.id}/members`.

**Non-Goals:**
- Altering the backend API schema or response structures.
- Changing direct member management for organizations or projects.

## Decisions

### 1. Reusable TeamMembersManager Component
Extract the roster management logic from `TeamMembersDialog` into a reusable `TeamMembersManager` component (or keep `TeamMembersDialog` as a wrapper around `TeamMembersManager`).
- **Props**: `teamId: string; teamName?: string; isModal?: boolean; onClose?: () => void;`
- **Internal features**: Member list with defensive avatar rendering, add member form, role modification dropdowns, remove member confirmation, and org member name/email enrichment.
- *Rationale*: Eliminates duplicate logic between the modal interceptor and the dedicated standalone page.

### 2. Parallel / Intercepting Route Structure
- Intercepted route: `src/app/(dashboard)/@modal/(.)teams/[id]/members/page.tsx`
  - Reads `params.id`.
  - Queries `useTeamDetail(id)` to resolve the team's name.
  - Mounts `<Dialog open onOpenChange={(open) => !open && router.back()}>`.
- Standalone page: `src/app/(dashboard)/teams/[id]/members/page.tsx`
  - Reads `params.id`.
  - Queries `useTeamDetail(id)`.
  - Renders back button (`<Link href="/teams">Back to Teams</Link>`), team header with member count and description, and the `<TeamMembersManager>`.

### 3. Navigation Integration in Team Cards
Replace the `onClick={() => setManagingTeam(...)}` button on team cards in `teams/page.tsx` and `organizations/[id]/teams/page.tsx` with:
```tsx
<Button variant="outline" size="sm" asChild className="h-8 px-2.5 text-xs font-normal">
  <Link href={`/teams/${team.id}/members`}>
    <UserCheck className="mr-1.5 h-3.5 w-3.5 text-primary" />
    Members
  </Link>
</Button>
```
- *Rationale*: Clean semantic link that Next.js intercepts on client navigation and renders as standalone page on middle-click/new tab/direct URL.

## Risks / Trade-offs

- [Risk] Team detail might be loading when the modal or page opens.
  → *Mitigation*: Show loading skeleton in the dialog header / page header while `useTeamDetail` resolves.
- [Risk] Team ID might not exist in backend (404).
  → *Mitigation*: Render graceful not-found or error alert with a button to return to `/teams`.
