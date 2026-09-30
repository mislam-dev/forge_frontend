# Design: Fix Project Deployment Trigger API

## Context

The backend Axum service exposes the project deployment trigger endpoint at:
```http
POST /api/v1/projects/{id}/deployments
```
Path Parameter:
- `id`: UUID of the project

Headers:
- `Authorization`: `Bearer <token>`
- `Organization-ID`: (optional UUID header, attached automatically by the Axios client interceptor when an organization workspace is active)

Request Body:
```json
{
  "branch": "main",
  "commit_hash": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
}
```
Body is optional (`required: false`). Fields `branch` and `commit_hash` are optional strings.

Response: `201 Created`
```json
{
  "message": "Deployment triggered successfully.",
  "data": {
    "id": "a1b2c3d4-e89b-12d3-a456-426614174000",
    "project_id": "07c0060e-8e8c-44c1-942c-3004f5a6c5b6",
    "triggered_by": "456e7890-e89b-12d3-a456-426614174000",
    "branch": "main",
    "commit_hash": "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    "status": "Queued",
    "build_duration": null,
    "deploy_duration": null,
    "error_message": null,
    "created_at": "2026-08-12T17:00:00Z",
    "updated_at": "2026-08-12T17:00:00Z"
  }
}
```

The frontend currently dispatches `POST /api/v1/deployments` with `{ project_id, branch, commit_hash, environment }`, causing 404 or bad routing. Furthermore, the UI expects `deployment_number` to be populated immediately, leading to `Deployment #undefined` toasts upon queuing.

## Goals / Non-Goals

**Goals:**
- Update `TriggerDeploymentRequest` and `DeploymentDTO` types in `src/lib/api/types.ts` to reflect the OpenAPI specification and backend return shape.
- Update `useTriggerDeployment` in `src/lib/hooks/api/useDeployments.ts` to call `POST /api/v1/projects/${targetProjectId}/deployments`.
- Support triggering deployments with or without explicit payload (`branch`, `commit_hash`).
- Normalize payload fields so that callers supplying `commit_sha` automatically map to `commit_hash`.
- Update deploy actions in `ProjectHeader.tsx`, `deployments/page.tsx`, and `deployments/[depId]/page.tsx` to handle queued deployment results gracefully without displaying `Deployment #undefined`.
- Update `docs/api/openapi.yaml` to document `POST /projects/{id}/deployments`.

**Non-Goals:**
- Changing deployment status polling intervals or SSE log streaming.
- Modifying backend Rust endpoints, database schema, or Docker build worker pipelines.
- Changing rollback or cancellation endpoints.

## Decisions

### Decision 1: Resolving Target Project ID in `useTriggerDeployment`
- **Choice**: Allow `useTriggerDeployment` to take `projectId?: string` on hook invocation, and also allow mutation callers to pass `project_id` or `projectId` in the mutation payload:
  ```ts
  const targetProjectId = payload?.project_id || projectId;
  if (!targetProjectId) {
    throw new Error('Project ID is required to trigger a deployment.');
  }
  ```
- **Rationale**: Existing components call `useTriggerDeployment(projectId)`. Supporting both hook-level binding and payload-level passing preserves backward compatibility across all call sites.

### Decision 2: Body Construction and Field Normalization
- **Choice**: Send an optional body only if `branch` or `commit_hash` (or `commit_sha`) is present:
  ```ts
  const body: TriggerDeploymentRequest = {};
  if (payload?.branch) body.branch = payload.branch;
  const commit = payload?.commit_hash || payload?.commit_sha;
  if (commit) body.commit_hash = commit;

  const res = (await apiClient.post(
    `/api/v1/projects/${targetProjectId}/deployments`,
    Object.keys(body).length > 0 ? body : undefined
  )) as unknown as ApiResponse<DeploymentDTO>;
  return res.data;
  ```
- **Rationale**: The backend specification marks `requestBody` as `required: false` and does not accept `project_id` inside the JSON body. Sending only `branch` and `commit_hash` adheres strictly to the backend schema.

### Decision 3: Safe Toast Notification Formatting
- **Choice**: Format toast messages using:
  ```ts
  const label = dep.deployment_number ? `#${dep.deployment_number}` : (dep.id ? dep.id.slice(0, 8) : '');
  description: label ? `Deployment ${label} queued successfully.` : 'Deployment queued successfully.',
  ```
- **Rationale**: Since `deployment_number` is null/omitted in the initial 201 response before worker assignment, using a fallback to short UUID or omitting the number prevents unsightly `#undefined` labels in the toast.

## Risks / Trade-offs

- **[Risk] Missing project ID**: If `useTriggerDeployment` is invoked without a `projectId`, the mutation would fail.
  - *Mitigation*: Throw an immediate descriptive error prior to network dispatch.
- **[Risk] Navigation after deployment**: `ProjectHeader.tsx` and `[depId]/page.tsx` navigate to `/projects/${projectId}/deployments/${dep.id}`.
  - *Mitigation*: The response from `POST /projects/{id}/deployments` returns `data.id`, so navigation remains smooth and valid.
