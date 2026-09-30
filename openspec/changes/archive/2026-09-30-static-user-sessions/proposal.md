# Proposal

## Why

The backend currently does not provide the `/api/v1/users/me/sessions` endpoint (and its corresponding deletion route `/api/v1/users/me/sessions/:id`), resulting in failed API network requests (such as 404 Not Found) when navigating to settings. However, the security and sessions UI is already designed and useful for user demonstration; we need to decouple it from live network calls, present static session information, and clearly denote the section with a "Static" badge.

## What Changes

- Remove the live HTTP network request to `/api/v1/users/me/sessions` and revocation call `/api/v1/users/me/sessions/:id` from `src/lib/hooks/api/useUserProfile.ts`.
- Retain the sessions UI in `src/app/(dashboard)/settings/security/page.tsx` and the overview summary in `src/app/(dashboard)/settings/page.tsx`, backed by static/mock session data.
- Add a visible "Static" badge to the "Active Sessions & Devices" section in `src/app/(dashboard)/settings/security/page.tsx`.
- Adjust session revocation handling to operate on local/static state (or disabled with static indicator) without triggering non-existent backend endpoints.

## Capabilities

### New Capabilities

*(None)*

### Modified Capabilities

- `domain-modules`: Modify the User Profile and Security Settings requirement to specify that the active sessions section displays static demo session information marked with a "Static" badge instead of querying the non-existent `/api/v1/users/me/sessions` backend endpoint.

## Impact

- **Affected Code**: `src/lib/hooks/api/useUserProfile.ts`, `src/app/(dashboard)/settings/security/page.tsx`, `src/app/(dashboard)/settings/page.tsx`.
- **APIs**: Eliminates network calls to `/api/v1/users/me/sessions` and `/api/v1/users/me/sessions/:sessionId`.
- **Dependencies & Systems**: No new external dependencies introduced.
