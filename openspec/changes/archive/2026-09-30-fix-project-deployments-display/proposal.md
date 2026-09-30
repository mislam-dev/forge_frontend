# Proposal

## Why

When querying project deployments via `GET /api/v1/projects/:id/deployments`, the backend responds with a nested paginated structure `{ data: { data: [...], page, per_page, total, total_pages }, message: "..." }`. The frontend hook `useDeploymentsList` only checks for a direct array or an `items` property in `res.data`, ignoring `res.data.data`. Consequently, deployments are resolved as an empty list and never displayed on project pages. Furthermore, the UI lacks resilient fallbacks for deployments where `deployment_number` or `commit_sha` are omitted in favor of UUIDs or `commit_hash`, and does not display backend failure messages (`error_message`) on failed deployments.

## What Changes

- **Envelope Unwrapping**: Update `useDeploymentsList` in `src/lib/hooks/api/useDeployments.ts` to properly parse `res.data.data` (conforming to `PaginatedData<DeploymentDTO>`) in addition to existing array and items envelopes.
- **Deployment Identifier Resilience**: Update deployment lists and summary cards (`/projects/[id]/deployments`, `/projects/[id]`, and `/projects/[id]/deployments/[depId]`) to display `#${dep.deployment_number}` when available, falling back cleanly to `#{dep.id.slice(0, 8)}`.
- **Commit Reference Resilience**: Safely resolve commit hashes using `dep.commit_hash || dep.commit_sha || 'HEAD'`.
- **Failure Diagnostics**: Display backend `error_message` on deployment history rows and status badges when a deployment has failed (e.g. "Not Found: Project not found").
- **Duration Metrics Support**: Calculate and display runtime durations from `duration_seconds` or combined `build_duration` and `deploy_duration`.

## Capabilities

### Modified Capabilities
- `domain-modules`: Update the `Deployment History and Status Filtering` requirement to specify support for paginated envelope payload structures (`data.data`), fallback display formatting for identifiers and commit hashes, and diagnostic error visibility on failed deployments.

## Impact

- `src/lib/hooks/api/useDeployments.ts`: Envelope response extraction logic.
- `src/app/(dashboard)/projects/[id]/deployments/page.tsx`: Deployment table rendering, identifier fallback, commit SHA/hash fallback, and error message indicators.
- `src/app/(dashboard)/projects/[id]/page.tsx`: Project overview latest deployment summary card resilience.
- `src/app/(dashboard)/projects/[id]/deployments/[depId]/page.tsx`: Deployment console header identifier and error diagnostics.
