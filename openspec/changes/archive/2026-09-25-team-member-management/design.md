# Design

## Context

Phase 4 introduced the basic team creation and deletion capabilities in `src/lib/hooks/api/useTeams.ts` and `src/app/(dashboard)/teams/page.tsx`. However, the user interface and API hooks for managing team members (`useTeamMembers`, `useAddTeamMember`, `useRemoveTeamMember`) were not wired up, leaving team cards showing a static count with no way to assign or remove members.

See `proposal.md` for motivation and `specs/domain-modules/spec.md` for behavioral requirements.

## Goals / Non-Goals

**Goals:**
- Implement `useTeamMembers(teamId)`, `useAddTeamMember(teamId)`, and `useRemoveTeamMember(teamId)` in `src/lib/hooks/api/useTeams.ts`.
- Implement `TeamMembersDialog` component in `src/components/teams/TeamMembersDialog.tsx` supporting member listing, adding members with roles (`Lead`, `Maintainer`, `Member`, `Viewer`), and removing members.
- Connect `TeamMembersDialog` to both the global teams directory (`/teams`) and organization teams page (`/organizations/[id]/teams`).
- Support team member mock endpoints (`GET`, `POST`, `DELETE /api/v1/teams/:id/members`) in `src/lib/api/mock/adapter.ts` with realistic seeds.
- Ensure team card `member_count` automatically updates upon adding or removing a member.

**Non-Goals:**
- Custom team-level RBAC policy engine (roles assigned to team members are descriptive within the team; project-level access is governed by Project Access).

## Decisions

### Decision 1: Reusable `TeamMembersDialog` Component
- **Approach**: Build a dedicated, reusable component `src/components/teams/TeamMembersDialog.tsx` using Radix `Dialog` and TanStack Query.
- **Rationale**: Both `/teams` and `/organizations/[id]/teams` display team cards and need the same roster inspection, member assignment, and removal functionality. Centralizing this avoids code duplication.
- **Alternatives Considered**: Navigating to a sub-route like `/teams/[id]/members`. A modal dialog allows users to manage members in-place without losing their search or organization context.

### Decision 2: Coordinated Cache Invalidation
- **Approach**: Adding or removing a team member invalidates both `teamsKeys.members(teamId)` and `teamsKeys.all`.
- **Rationale**: The parent team list displays `member_count`. Invalidating both queries ensures the card count reflects the updated roster immediately without requiring a full page refresh.

### Decision 3: Stateful Mock Team Member Store
- **Approach**: In `src/lib/api/mock/adapter.ts`, maintain an in-memory dictionary `teamMembersStore: Record<string, TeamMemberDTO[]>` pre-seeded with mock members for `team-1`, `team-2`, and `team-3`. When members are added or removed, also adjust `teamsStore[teamIndex].member_count`.
- **Rationale**: Delivers a fully functional offline demo experience consistent with the Phase 4 mock architecture.

## Risks / Trade-offs

- **[Risk] Multiple teams sharing member IDs in mock store**:
  → *Mitigation*: Ensure mock member entries generate unique IDs (`mem-${Date.now()}`) and delete by member `id`.
- **[Risk] Visual clutter on team cards**:
  → *Mitigation*: Provide a clean "Manage Members" button alongside the delete button on each team card.
