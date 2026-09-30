# Tasks

## 1. Type Definitions & API Documentation

- [x] 1.1 Update `TriggerDeploymentRequest` and `DeploymentDTO` in `src/lib/api/types.ts` to support optional `branch`, `commit_hash`, `build_duration`, `deploy_duration`, and `error_message`, exporting `ApiResponseDeployment`.
- [x] 1.2 Update `docs/api/openapi.yaml` under `/projects/{id}/deployments` to include the `post` operation specification with parameters, request body, and 201 response schema.

## 2. API Hook Implementation

- [x] 2.1 Refactor `useTriggerDeployment` in `src/lib/hooks/api/useDeployments.ts` to target `POST /api/v1/projects/${targetProjectId}/deployments`.
- [x] 2.2 Support resolving `targetProjectId` from hook parameter or mutation payload, throwing a client-side error if missing.
- [x] 2.3 Send JSON body containing `{ branch, commit_hash }` only when values are provided, mapping `commit_sha` to `commit_hash` for backwards compatibility.
- [x] 2.4 Ensure query invalidation triggers for `deploymentsKeys.all` and project deployment lists.

## 3. UI Actions & Safe Toast Messaging

- [x] 3.1 Update `ProjectHeader.tsx` deploy button handler to safely format toast notification when `dep.deployment_number` is null/omitted.
- [x] 3.2 Update `src/app/(dashboard)/projects/[id]/deployments/page.tsx` deployment trigger toast handler to safely handle null/omitted `deployment_number`.
- [x] 3.3 Update `src/app/(dashboard)/projects/[id]/deployments/[depId]/page.tsx` `handleRedeploy` action to pass `branch` and `commit_hash: deployment.commit_hash || deployment.commit_sha`, with safe toast messaging.

## 4. Verification

- [x] 4.1 Run TypeScript type check (`pnpm tsc --noEmit`) to verify zero compilation errors across modified files.
- [x] 4.2 Run production build (`pnpm build`) to verify project builds cleanly.
