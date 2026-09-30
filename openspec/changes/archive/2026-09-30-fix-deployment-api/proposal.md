# Proposal: Fix Project Deployment Trigger API

## Why

When clicking the "Deploy Now" button on the project overview header, "Trigger Deployment" on the deployments history page, or "Redeploy" on the deployment detail page, the frontend fails to initiate the build. Currently, `useTriggerDeployment` dispatches a `POST /api/v1/deployments` request with `{ project_id, branch, commit_hash, environment }`.

According to the OpenAPI specification, project deployments are initiated via:
`POST /api/v1/projects/{id}/deployments`
- **Path Parameter**: `id` (the project UUID).
- **Optional Request Header**: `Organization-ID` (automatically handled by the Axios client interceptor when an organization workspace is active).
- **Request Body** (optional): `TriggerDeploymentRequest` with optional `branch: string` (e.g. `"main"`) and `commit_hash: string`.
- **Response**: `201 Created` returning `ApiResponseDeployment` containing `{ message: string, data: DeploymentDTO }`.

Furthermore, the newly queued deployment response may not include a sequential `deployment_number` immediately (it contains `id`, `project_id`, `triggered_by`, `branch`, `commit_hash`, `status: "Queued"`, `build_duration: null`, `deploy_duration: null`, `error_message: null`, `created_at`, `updated_at`). Existing toast notifications rely on `${dep.deployment_number}`, causing `Deployment #undefined` to be shown to the user when queued.

Aligning the trigger deployment endpoint, hook parameters, request body, and toast handling to the backend contract restores the ability to trigger and track deployments.

## What Changes

- **Update API Types (`src/lib/api/types.ts`)**:
  - Update `TriggerDeploymentRequest` to make all body fields optional (`branch?: string`, `commit_hash?: string`), retaining backward-compatible aliases (`commit_sha?: string`, `project_id?: string`, `environment?: string`).
  - Extend `DeploymentDTO` with nullable status metadata: `build_duration?: number | null`, `deploy_duration?: number | null`, `error_message?: string | null`.
  - Export `ApiResponseDeployment` alias for `ApiResponse<DeploymentDTO>`.
- **Update Deployment Mutation Hook (`src/lib/hooks/api/useDeployments.ts`)**:
  - Update `useTriggerDeployment(projectId?: string)` to issue `POST /api/v1/projects/${targetProjectId}/deployments`.
  - Resolve `targetProjectId` from either mutation variables or hook argument, raising a clean client error if not provided.
  - Forward optional `{ branch, commit_hash }` in the request body only when supplied.
  - Invalidate relevant query keys (`deploymentsKeys.all`, `deploymentsKeys.list(targetProjectId)`) upon successful creation.
- **Update Deploy Buttons and Notification Handling**:
  - `src/components/projects/ProjectHeader.tsx`: Update the "Deploy Now" action to safely display deployment identifier (`dep.deployment_number ? `#${dep.deployment_number}` : dep.id.slice(0, 8)`).
  - `src/app/(dashboard)/projects/[id]/deployments/page.tsx`: Update toast description to safely handle missing `deployment_number`.
  - `src/app/(dashboard)/projects/[id]/deployments/[depId]/page.tsx`: In `handleRedeploy`, map `branch` and `commit_hash: deployment.commit_hash || deployment.commit_sha` when triggering redeployment, with safe toast messaging.
- **Update OpenAPI Documentation (`docs/api/openapi.yaml`)**:
  - Add `post` operation under `/projects/{id}/deployments` matching the backend specification.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `domain-modules`: Update `Requirement: Deployment History and Status Filtering` so that triggering a new deployment dispatches `POST /api/v1/projects/:id/deployments` with optional `{ branch, commit_hash }` and handles `201 Created` `ApiResponseDeployment`.

## Impact

- **API Endpoint**: Transitions deployment creation from `/api/v1/deployments` to `/api/v1/projects/:id/deployments`.
- **Affected Files**:
  - `src/lib/api/types.ts`
  - `src/lib/hooks/api/useDeployments.ts`
  - `src/components/projects/ProjectHeader.tsx`
  - `src/app/(dashboard)/projects/[id]/deployments/page.tsx`
  - `src/app/(dashboard)/projects/[id]/deployments/[depId]/page.tsx`
  - `docs/api/openapi.yaml`
