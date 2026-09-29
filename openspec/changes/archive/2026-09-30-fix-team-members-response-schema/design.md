# Design

## Context

The Axum backend endpoint `GET /api/v1/teams/:team_id/members` returns an array of team member association records:
```json
{
  "joined_at": "2026-09-29T18:37:17.050956+00:00",
  "role": "admin",
  "team_id": "be4fd16e-71d9-4cf6-a2f8-aa4f9429d2d2",
  "user_id": "77371d01-2e92-4e51-99ae-f4dd337d6085"
}
```
Currently, `TeamMemberDTO` in `src/lib/api/types.ts` defines `id`, `name`, and `email` as mandatory strings. In `TeamMembersDialog.tsx`, avatar initials are generated using `member.name.slice(0, 2).toUpperCase()`, triggering a fatal `TypeError: Cannot read properties of undefined (reading 'slice')` that unmounts the dashboard page via Next.js error boundaries.

## Goals / Non-Goals

**Goals:**
- Update `TeamMemberDTO` in `src/lib/api/types.ts` so `name`, `email`, and `id` are optional, while ensuring `team_id`, `user_id`, `role`, and `joined_at` are properly recognized.
- Make all rendering in `TeamMembersDialog.tsx` completely defensive: fallback for avatar initials, name, and email without throwing errors.
- Optionally resolve member names and emails from the active organization's members list (`useOrgMembers`) by matching `user_id`.
- Ensure role selectors and badges support backend roles (`admin`, `member`, `developer`, `viewer`, `lead`, `maintainer`) without crashing or showing blank options.
- Use `member.id || member.user_id` as keys and identifier payloads for role updates and removals.

**Non-Goals:**
- Refactoring the Axum backend to join user profile tables on team member queries.
- Altering project access member logic which already uses defensive fallbacks.

## Decisions

### 1. DTO Type Relaxation with Backend Alignment
- `TeamMemberDTO` will type `id?: string; user_id: string; team_id: string; name?: string; email?: string; role: string; joined_at: string;`.
- *Rationale*: Allows both raw backend responses and client-enriched member records to satisfy TypeScript types seamlessly.

### 2. Defensive Display Resolution
- Primary display text: `resolvedName || member.name || member.email || `User (${member.user_id.slice(0, 8)})``.
- Subtitle: `resolvedEmail || member.email || member.user_id`.
- Avatar initials: `(resolvedName || member.name || member.email || member.user_id || 'U').slice(0, 2).toUpperCase()`.
- *Rationale*: Guarantees that neither `.slice()` nor string operations ever run against `undefined`.

### 3. Optional Org Member Enrichment
- `TeamMembersDialog` can read `useOrgMembers(activeOrgId)` (if in an organization context) and create an in-memory lookup map by `user_id`.
- If an organization member match is found, their `name` and `email` enrich the team member row; otherwise, it falls back to the truncated `user_id`.
- *Rationale*: Delivers a human-friendly UX when org member data is already cached without creating duplicate network roundtrips.

### 4. Normalized Role Handling
- The `<select>` element in `TeamMembersDialog` will support standard role choices (`admin`, `developer`, `member`, `viewer`, `lead`, `maintainer`), normalizing role values case-insensitively.

## Risks / Trade-offs

- [Risk] Team member deletion or role update API expects either `user_id` or an association `id`.
  → *Mitigation*: Pass `member.user_id || member.id` as the member identifier in `useRemoveTeamMember` and `useUpdateTeamMemberRole`.
- [Risk] In a personal workspace, `activeOrgId` may be null.
  → *Mitigation*: The org member lookup is strictly optional; when unavailable, it gracefully defaults to displaying `User (<user_id_short>)`.
