# Proposal

## Why

When viewing an organization overview page (`/organizations/[id]`), the dashboard error boundary catches a runtime `TypeError: Cannot read properties of undefined (reading 'slice')` at `page.tsx:84:29`. This occurs because the backend `OrgMemberResponse` payload from `GET /api/v1/organizations/:id/members` returns:
```json
{
  "email": "admin1@forge.local",
  "joined_at": "2026-09-29T14:38:02.948994+00:00",
  "organization_id": "1b913f11-5abc-4dc8-b0a6-3aada3466472",
  "role": "owner",
  "user_id": "77371d01-2e92-4e51-99ae-f4dd337d6085"
}
```
The payload contains `user_id`, `organization_id`, `email`, `role`, and `joined_at`, but does not include a `name` property (and `email` can be nullable). Unconditional `m.name.slice(0, 2)` calls in member rendering crash the page.

## What Changes

- **Safe Organization Member Previews**: Update `/organizations/[id]/page.tsx` to safely resolve display names and avatar initials using fallback chains (`m.name || m.email || m.user_id || 'Member'`) and safe avatar generation before calling `.slice(0, 2)`.
- **Safe Organization Members Page**: Update `/organizations/[id]/members/page.tsx` to safely resolve display names, email fallbacks, and avatar initials, preventing runtime errors when `member.name` is undefined.
- **Robust Identifier and Role Handling**: Ensure member identifiers (`member.user_id || member.id`) are reliably passed to role mutation and deletion dialogs.
- **Type Definition Alignment**: Update `OrgMemberDTO` in `src/lib/api/types.ts` to reflect the OpenAPI 3.0 `OrgMemberResponse` schema where `name` is optional, `email` can be nullable, and `organization_id` / `user_id` are primary keys.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `domain-modules`: Update the Organizations and Tenant Management requirement to mandate that organization member previews and management tables safely display member profiles, fallbacks, and avatar initials without throwing runtime errors when member `name` or `email` are absent in API responses.

## Impact

- **Affected Code**:
  - `src/app/(dashboard)/organizations/[id]/page.tsx`
  - `src/app/(dashboard)/organizations/[id]/members/page.tsx`
  - `src/lib/api/types.ts`
- **APIs**: Conforms strictly to backend `GET /api/v1/organizations/:id/members` OpenAPI 3.0 contract.
- **Dependencies**: No new external dependencies required.
