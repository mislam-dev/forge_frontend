# Design

## Context

See `proposal.md` for motivation. Currently, the backend OpenAPI spec (`docs/api/openapi.yaml`) defines `OrgMemberResponse` with `organization_id`, `user_id`, `email` (nullable), `role`, and `joined_at`. It does not include a `name` property. However, `src/app/(dashboard)/organizations/[id]/page.tsx` and `src/app/(dashboard)/organizations/[id]/members/page.tsx` directly call `m.name.slice(0, 2)` without null checks, causing unhandled runtime exceptions (`TypeError: Cannot read properties of undefined (reading 'slice')`) in the browser.

## Goals / Non-Goals

**Goals:**
- Eliminate crashes caused by undefined `name` properties when rendering organization member previews and management tables.
- Establish a uniform, resilient fallback hierarchy for display names and avatar initials (`name` → `email` → `user_id` → fallback abbreviation).
- Ensure identifier consistency (`user_id` vs `id`) for keys and mutation callbacks (role update and member removal).
- Align `OrgMemberDTO` TypeScript interfaces with backend response envelopes to enable compile-time safety.

**Non-Goals:**
- Changing backend Axum endpoints or altering OpenAPI contracts.
- Modifying unrelated member interfaces (e.g. project collaborators or team members) that already possess defensive fallbacks.

## Decisions

### 1. Standardized Member Display and Avatar Fallback Hierarchy
We will derive `displayName` and `avatarInitials` defensively:
```typescript
const displayName = member.name || member.email || member.user_id || 'Member';
const initials = (member.name || member.email || member.user_id || 'MB').slice(0, 2).toUpperCase();
```
- **Rationale**: Matches conventions established in `TeamMembersManager.tsx` and `src/app/(dashboard)/projects/[id]/access/page.tsx`.
- **Alternatives Considered**: Using an empty avatar badge when name is absent. Rejected because two-letter initials provide better visual hierarchy and UX consistency in avatar circles.

### 2. Dual-Identifier Compatibility (`user_id` and `id`)
Backend responses supply `user_id` as the primary identifier, whereas legacy frontend typing had `id`. Components will use `member.user_id || member.id` as React keys and pass the resolved ID to mutation hooks (`updateRole.mutateAsync({ memberId, ... })` and `removeMember.mutateAsync(memberId)`).
- **Rationale**: Guaranteed compatibility whether mocked data or live backend responses are consumed.
- **Alternatives Considered**: Refactoring all hooks to require only `user_id`. Rejected to avoid breaking existing tests or mock responses.

### 3. TypeScript Type Definition Update
Update `OrgMemberDTO` in `src/lib/api/types.ts`:
```typescript
export interface OrgMemberDTO {
  id?: string;
  org_id?: string;
  organization_id?: string;
  user_id: string;
  name?: string;
  email?: string | null;
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer' | 'admin' | 'developer' | 'viewer' | string;
  joined_at: string;
}
```
- **Rationale**: Forces strict TypeScript checking so future code cannot assume `m.name` or `m.email` are non-null strings without checking.

## Risks / Trade-offs

- **[Risk] Long user IDs displayed in place of missing names/emails** → **Mitigation**: Use CSS truncation classes (`truncate`) on display strings and limit avatar initials to exactly 2 characters via `.slice(0, 2)`.
