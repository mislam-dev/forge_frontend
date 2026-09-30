# Design

## Context

See `proposal.md` for motivation. Currently, `useActiveSessions` in `src/lib/hooks/api/useUserProfile.ts` makes a `GET` request to `/api/v1/users/me/sessions`, and `useRevokeSession` performs a `DELETE` request to `/api/v1/users/me/sessions/${sessionId}`. Because these endpoints do not exist on the backend, these requests fail with 404 errors. Consumers of these hooks include `src/app/(dashboard)/settings/security/page.tsx` and `src/app/(dashboard)/settings/page.tsx`.

## Goals / Non-Goals

**Goals:**
- Remove network calls to `/api/v1/users/me/sessions` and `/api/v1/users/me/sessions/:sessionId`.
- Retain the sessions UI and visual layout across settings pages using realistic static session data adhering to `UserSessionDTO`.
- Add a visible "Static" badge to the "Active Sessions & Devices" card header in `src/app/(dashboard)/settings/security/page.tsx`.
- Support client-side simulation for session revocation without backend network calls.

**Non-Goals:**
- Implementing Axum backend endpoints for session management.
- Completely removing the Active Sessions UI cards.

## Decisions

### Decision 1: Provide static session mock data via `useActiveSessions`
- **Approach**: Keep the hook signature for `useActiveSessions()` returning `UserSessionDTO[]`, but return a predefined static dataset (current desktop browser session and a secondary device) directly without issuing a network request via `apiClient`.
- **Rationale**: Keeps existing components (`settings/page.tsx` and `settings/security/page.tsx`) intact without requiring breaking interface refactors, while eliminating 404 network errors.
- **Alternatives considered**:
  - Hardcode data directly inside the page components: Rejected because multiple pages consume `useActiveSessions()`.

### Decision 2: Local simulation for `useRevokeSession`
- **Approach**: Convert `useRevokeSession` into a client-side mutation that removes the session from the local React Query cache or simulates successful revocation with a success toast.
- **Rationale**: Preserves the interactivity of the Revoke button without triggering network failures.
- **Alternatives considered**:
  - Disabling or removing the Revoke button entirely: Keeps UI fidelity lower and changes button behavior.

### Decision 3: Visual Badge Placement
- **Approach**: Add a `<Badge variant="outline">Static</Badge>` in the header row of the "Active Sessions & Devices" card next to the heading in `src/app/(dashboard)/settings/security/page.tsx`.
- **Rationale**: Clearly informs users and reviewers that the section displays static mock data rather than live connected sessions.

## Risks / Trade-offs

- **[Risk] Future backend integration will require restoring network call**:
  - *Mitigation*: Maintain `UserSessionDTO` type definitions and keep the hook structure identical so restoring live API connectivity later is straightforward.
