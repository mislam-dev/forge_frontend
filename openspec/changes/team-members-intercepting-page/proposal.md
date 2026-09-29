# Proposal

## Why

Currently, team roster management is controlled entirely via local React component state (`managingTeam`) which pops up an unrouted modal dialog. Because there is no dedicated URL for a team's member roster, users cannot bookmark, share links to, or use browser history navigation (back/forward) for team membership management. Introducing a dedicated `/teams/[id]/members` route with Next.js parallel and intercepting routes (`@modal/(.)teams/[id]/members`) provides seamless in-context modal management during client navigation while supporting standalone direct page visits and bookmarks, consistent with `/teams/new`, `/organizations/new`, and `/projects/new`.

## What Changes

- **Add `useTeamDetail` hook**: Add a query hook in `src/lib/hooks/api/useTeams.ts` to fetch team metadata (`GET /api/v1/teams/:id`) to power dedicated page headers and modals.
- **Reusable Team Members Management UI**: Provide a reusable team members roster component (`TeamMembersManager` / `TeamMembersView`) that supports both modal dialog wrapping and full-page layout embedding.
- **Dedicated Standalone Page**: Implement `src/app/(dashboard)/teams/[id]/members/page.tsx` rendering a dedicated page with "Back to Teams" navigation, team header metadata, and the roster management interface.
- **Parallel & Intercepted Route**: Implement `src/app/(dashboard)/@modal/(.)teams/[id]/members/page.tsx` to intercept client-side navigation to `/teams/[id]/members`, rendering the roster inside a modal dialog without unmounting the underlying teams page.
- **Link Update in Teams Directories**: Update the "Members" button on team cards in `/teams` and `/organizations/[id]/teams` to link to `/teams/${team.id}/members`.

## Capabilities

### New Capabilities
*(None)*

### Modified Capabilities
- `domain-modules`: Introduce requirement for dedicated team member management routing with parallel and intercepting modal overlays.

## Impact

- `src/lib/hooks/api/useTeams.ts`: Added `useTeamDetail` hook.
- `src/components/teams/TeamMembersDialog.tsx` & `src/components/teams/TeamMembersManager.tsx`: Reusable member roster management.
- `src/app/(dashboard)/teams/[id]/members/page.tsx`: New dedicated page route.
- `src/app/(dashboard)/@modal/(.)teams/[id]/members/page.tsx`: New parallel/intercepted route.
- `src/app/(dashboard)/teams/page.tsx` & `src/app/(dashboard)/organizations/[id]/teams/page.tsx`: Updated buttons to route to `/teams/${team.id}/members`.
