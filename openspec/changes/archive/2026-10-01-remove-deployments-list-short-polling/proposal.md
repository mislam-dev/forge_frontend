# Proposal

## Why

The project deployments list query (`useDeploymentsList`) executes short polling against `GET /api/v1/projects/:id/deployments` every 4 seconds when active builds exist, and every 20 seconds otherwise. This results in continuous recurring network requests across `/projects/[id]/deployments` and project overview pages. Removing this polling eliminates unwanted background requests and aligns deployment listing with an on-demand, user-initiated or mutation-invalidated lifecycle.

## What Changes

- Remove `refetchInterval` automated polling from `useDeploymentsList` in `src/lib/hooks/api/useDeployments.ts`.
- Ensure deployments list views (`/projects/[id]/deployments` and project overview) fetch deployment data on mount and refresh upon user actions (e.g. triggering deployment or manual page navigation) without scheduling background interval timers.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `domain-modules`: Modify requirement for `Deployment History and Status Filtering` to omit continuous background short polling against `/api/v1/projects/:id/deployments`.

## Impact

- **Affected Code**: `src/lib/hooks/api/useDeployments.ts` (`useDeploymentsList`).
- **API Traffic**: Stops repeated `GET /api/v1/projects/:id/deployments` polling requests.
- **Breaking Changes**: None. Data loading, caching, and mutation invalidations remain functional.
