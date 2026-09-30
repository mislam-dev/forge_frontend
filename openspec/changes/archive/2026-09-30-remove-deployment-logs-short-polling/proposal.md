# Proposal

## Why

The deployment console and logs view currently performs aggressive short polling (fetching deployment details every 3 seconds via `useDeploymentDetail`). This generates unnecessary server load and redundant network requests while real-time build updates are already handled via Server-Sent Events (SSE). The user has requested to remove this short polling mechanism from the deployment logs view, deferring further redesign of this section to a later phase.

## What Changes

- Remove automated `refetchInterval` short-polling from `useDeploymentDetail` in `src/lib/hooks/api/useDeployments.ts`.
- Ensure the deployment console page (`/projects/[id]/deployments/[depId]`) relies on initial fetch, SSE stream events, and user interactions (or manual refresh/actions) rather than repeating 3-second background polling intervals.
- Maintain existing cancel, redeploy, log streaming, and log download functionality without disruption.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `domain-modules`: Modify requirement for deployment log streaming and build console to eliminate recurring short polling intervals for deployment status updates during log viewing.

## Impact

- **Affected Code**: `src/lib/hooks/api/useDeployments.ts` (`useDeploymentDetail`), and references within `src/app/(dashboard)/projects/[id]/deployments/[depId]/page.tsx`.
- **API Traffic**: Eliminates continuous `GET /api/v1/deployments/:id` polling requests while users are viewing deployment logs.
- **Breaking Changes**: None. Deployment detail query continues to function for initial page load and on-demand cache invalidations.
