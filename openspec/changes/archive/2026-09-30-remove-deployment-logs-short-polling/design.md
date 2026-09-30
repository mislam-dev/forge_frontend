# Design

## Context

See `proposal.md` for motivation.

In `src/lib/hooks/api/useDeployments.ts`, the `useDeploymentDetail` hook currently includes a `refetchInterval` function:
```typescript
refetchInterval: (query) => {
  const data = query.state.data;
  if (data && ['Success', 'healthy', 'Failed', 'failed', 'Cancelled', 'cancelled'].includes(data.status)) {
    return false;
  }
  return 3000;
}
```
When navigating to the deployment console (`src/app/(dashboard)/projects/[id]/deployments/[depId]/page.tsx`), this causes continuous 3-second short-polling requests against `GET /api/v1/deployments/:id` while a deployment is running or queued.

## Goals / Non-Goals

**Goals:**
- Remove the automated short-polling `refetchInterval` from `useDeploymentDetail`.
- Prevent recurring periodic network requests on the deployment logs viewer page.
- Retain cache invalidation and immediate refetching following user-triggered actions (Cancel, Redeploy).

**Non-Goals:**
- Implementing SSE-based state transitions or WebSocket deployment lifecycle synchronization at this time (deferred by user to a future update).
- Modifying the overview deployments list polling (`useDeploymentsList`).

## Decisions

### Decision: Remove `refetchInterval` from `useDeploymentDetail`
- **Choice**: Remove the `refetchInterval` property entirely from the `useDeploymentDetail` query options in `src/lib/hooks/api/useDeployments.ts`.
- **Rationale**: Directly eliminates periodic background polling on the deployment detail and logs page while keeping TanStack Query's standard caching, initial fetch, and manual invalidation intact.
- **Alternatives Considered**:
  - *Keep polling with an option flag `enabledPolling = false`*: Unnecessary complexity when the requirement is to eliminate the short polling from this section.
  - *Poll via SSE status events*: The user explicitly mentioned they will look into and redesign this section later.

## Risks / Trade-offs

- **[Risk] Deployment status badge or elapsed time in the header will not auto-refresh if status changes purely on the server without user action**:
  → **Mitigation**: Accepted per user specification; manual refresh or redeploy/cancel actions still trigger state updates, and an improved status update mechanism will be introduced later.
