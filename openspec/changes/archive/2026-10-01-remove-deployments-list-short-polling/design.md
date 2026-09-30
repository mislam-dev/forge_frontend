# Design

## Context

See `proposal.md` for motivation.

In `src/lib/hooks/api/useDeployments.ts`, the `useDeploymentsList` hook defines an automated `refetchInterval` callback:
```typescript
refetchInterval: (query) => {
  const data = query.state.data;
  const hasActive = data?.some((d) =>
    ['Queued', 'queued', 'Building', 'cloning', 'building', 'Deploying', 'running', 'Running'].includes(d.status)
  );
  return hasActive ? 4000 : 20000;
}
```
This causes frequent background polling requests against `GET /api/v1/projects/:id/deployments` on the deployment history page and the project overview.

## Goals / Non-Goals

**Goals:**
- Remove the `refetchInterval` property from `useDeploymentsList`.
- Ensure `useDeploymentsList` only fetches on component mount or explicit query invalidation.
- Retain existing mutation onSuccess invalidations (`useTriggerDeployment`, `useCancelDeployment`, `useRollbackProject`, etc.) so that user actions still refresh the deployment list.

**Non-Goals:**
- Modifying other unrelated module polling (e.g., dashboard or notifications).
- Adding new polling configuration flags.

## Decisions

### Decision: Remove `refetchInterval` from `useDeploymentsList`
- **Choice**: Omit the `refetchInterval` configuration from `useDeploymentsList` in `src/lib/hooks/api/useDeployments.ts`.
- **Rationale**: Completely stops the 4s / 20s periodic polling loops on project deployments list views.
- **Alternatives Considered**:
  - *Keep a 60s+ fallback interval*: The user explicitly stated the short polling problem is not fixed and requested its removal.
  - *Conditional polling flag*: Adds unnecessary prop drilling when the system requirement is to stop continuous polling.

## Risks / Trade-offs

- **[Risk] Deployment list table will not update automatically if a remote deployment completes without user interaction**:
  → **Mitigation**: Accepted per user intent; user actions (triggering new builds, cancelling, manual navigation) continue to invalidate the cache and fetch fresh data.
