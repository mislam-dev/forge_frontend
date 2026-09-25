# Proposal

## Why

While users can currently create and delete teams on `/teams` and `/organizations/[id]/teams`, there is no mechanism or user interface to view team members, assign new members, or remove members from a team. Adding team membership management enables workspace administrators and team leads to manage team rosters and assign functional squads to projects.

## What Changes

- **API Types & Request DTOs**: Add `AddTeamMemberRequest` and ensure `TeamMemberDTO` has role and user attributes in `src/lib/api/types.ts`.
- **React Query Custom Hooks**: Expand `src/lib/hooks/api/useTeams.ts` with `useTeamMembers(teamId)`, `useAddTeamMember(teamId)`, and `useRemoveTeamMember(teamId)` with query key cache invalidation.
- **Offline Mock Provider**: Support `GET /api/v1/teams/:id/members`, `POST /api/v1/teams/:id/members`, and `DELETE /api/v1/teams/:id/members/:memberId` in `src/lib/api/mock/adapter.ts` with realistic seeds.
- **Team Views UI**:
  - Global Teams (`src/app/(dashboard)/teams/page.tsx`): Add an interactive "Manage Members" modal or drawer for each team card, showing the current member roster, an "Add Member" form (with role selector), and a "Remove Member" button.
  - Organization Teams (`src/app/(dashboard)/organizations/[id]/teams/page.tsx`): Enable the same team member management experience within the organization context.

## Capabilities

### New Capabilities
*(None)*

### Modified Capabilities
- `domain-modules`: Update `Requirement: Global and Organization Teams Management` to specify observable behaviors for adding and removing team members.

## Impact

- **Affected Code**: `src/lib/api/types.ts`, `src/lib/hooks/api/useTeams.ts`, `src/lib/api/mock/adapter.ts`, `src/lib/api/mock/seeds.ts`, `src/app/(dashboard)/teams/page.tsx`, `src/app/(dashboard)/organizations/[id]/teams/page.tsx`.
- **Dependencies & APIs**: Zero new npm dependencies; follows existing TanStack Query and Radix UI dialog patterns.
