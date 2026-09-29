# Design: Align API Endpoints and Client with OpenAPI Specification

## Context
See [proposal.md](proposal.md) for motivation and [specs/](specs/) for normative requirement deltas.
The current frontend transport layer (`src/lib/api/client.ts`), data transfer objects (`src/lib/api/types.ts`), React Query hooks (`src/lib/hooks/api/`), and mock fallback engine (`src/lib/api/mock/adapter.ts`) were created with slight route and envelope discrepancies compared to the official Axum OpenAPI 3.0 contract specified in `docs/api/openapi.yaml` and `docs/api/API_REQUESTS_SUMMARY.md`.

This design details the technical choices and migration strategy to align the frontend codebase with the backend contract without breaking existing user flows or offline mock capabilities.

## Goals / Non-Goals

**Goals:**
- Align all endpoint URLs, HTTP methods, request bodies, and query parameters with `docs/api/openapi.yaml`.
- Standardize response envelope types (`ApiResponse<T>`, `ApiPaginatedResponse<T>`, `ApiErrorResponse`) and domain DTOs in `types.ts`.
- Expand hook coverage for repository lifecycle, granular environment variable operations, deployments & rollback, SSE log actions, notifications, and access-control (RBAC).
- Synchronize `src/lib/api/mock/adapter.ts` and `src/lib/api/mock/seeds.ts` to mock all OpenAPI paths and response formats seamlessly.
- Ensure all existing Next.js App Router pages and dialogs continue to compile and function cleanly with zero TypeScript errors.

**Non-Goals:**
- Modifying backend Axum Rust handlers or changing `docs/api/openapi.yaml` (the OpenAPI spec is the authoritative source of truth).
- Rewriting UI layout or redesigning visual components beyond adapting them to the aligned hook interfaces.
- Introducing a code generator tool (e.g. `openapi-typescript-codegen`) at this time; handwritten TypeScript DTOs and TanStack hooks will be carefully matched and maintained.

## Decisions

### Decision 1: Standardizing Envelope Types and Response Unwrapping
**Choice:** Keep the Axios response interceptor unwrapping `response.data`, and update `types.ts`:
```typescript
export interface ApiResponse<T> {
  message: string;
  data: T;
  status?: 'success' | 'error'; // preserved as optional for backward compatibility
}

export interface ApiPaginatedResponse<T> {
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiErrorResponse {
  is_error: boolean;
  code: string;
  message: string;
  errors?: Record<string, string[]>;
}
```
**Rationale:** The OpenAPI specification wraps all responses in `{ message, data }` and errors in `{ is_error, code, message, errors }`. Retaining optional `status` in helper types maintains compatibility with existing UI components while matching the backend schema exactly.

**Alternatives Considered:**
- Completely stripping `message` in Axios interceptor and returning only `data`: Rejected because callers need access to server confirmation messages (e.g. for toasts) and pagination metadata.

### Decision 2: Deployment and Build Log Hook Structure
**Choice:** Update `useDeployments.ts` and `useSseStream.ts` to align with:
- Trigger deployment: `POST /api/v1/deployments` with `{ project_id, branch, commit_hash, environment }`.
- Fetch deployment: `GET /api/v1/deployments/:id`.
- List project deployments: `GET /api/v1/projects/:id/deployments`.
- Redeploy: `POST /api/v1/deployments/:id/redeploy`.
- Rollback: `POST /api/v1/projects/:id/rollback` with `{ target_deployment_id, environment }`.
- Historical logs: `GET /api/v1/deployments/:id/logs`.
- Search logs: `GET /api/v1/deployments/:id/logs/search?q=:query`.
- Download raw log: `GET /api/v1/deployments/:id/logs/download`.
- Real-time SSE logs: `GET /api/v1/deployments/:id/logs/stream`.

**Rationale:** This mirrors Section 12 & 13 of `API_REQUESTS_SUMMARY.md` and `openapi.yaml`.

### Decision 3: Granular Environment Variables Operations
**Choice:** Replace monolithic `PUT /api/v1/projects/:id/env-vars` with granular hooks:
- `useCreateEnvVar(projectId)`: `POST /api/v1/projects/:id/env-vars`
- `useBulkCreateEnvVars(projectId)`: `POST /api/v1/projects/:id/env-vars/bulk`
- `useUpdateEnvVar(projectId)`: `PUT /api/v1/projects/:id/env-vars/:env_id`
- `useDeleteEnvVar(projectId)`: `DELETE /api/v1/projects/:id/env-vars/:env_id`
- `useDecryptEnvVars(projectId, environment)`: `GET /api/v1/projects/:id/env-vars/decrypt?environment=:env`

**Rationale:** The backend stores and validates variables individually and supports bulk insertion.

### Decision 4: Repository Sub-Module Hook Suite
**Choice:** In `useProjectRepo.ts`, implement:
- `useValidateRepository(projectId)`: `POST /api/v1/projects/:id/repository/validate`
- `useSaveRepository(projectId)`: `POST /api/v1/projects/:id/repository`
- `useProjectRepository(projectId)`: `GET /api/v1/projects/:id/repository`
- `useCloneRepository(projectId)`: `POST /api/v1/projects/:id/repository/clone`
- `useLatestCommit(projectId)`: `GET /api/v1/projects/:id/repository/commit`
- `useSwitchBranch(projectId)`: `PUT /api/v1/projects/:id/repository/branch`
- `useRemoteBranches(projectId)`: `GET /api/v1/projects/:id/repository/branches`

**Rationale:** Gives full control over Git repository operations directly from the project settings and wizard.

### Decision 5: Dedicated Access Control (RBAC) Hook Module
**Choice:** Add `src/lib/hooks/api/useAccessControl.ts` to manage:
- System roles (`GET|POST /api/v1/access-control/roles`, `GET|PATCH|DELETE /api/v1/access-control/roles/:id`)
- System permissions (`GET|POST /api/v1/access-control/permissions`, `GET|PATCH|DELETE /api/v1/access-control/permissions/:id`)
- Role-permission assignments (`POST .../roles/permissions/assign`, `POST .../roles/permissions/remove`, `GET .../roles/permissions/:id`)
- User-role assignments (`POST .../role/assign`, `POST .../role/remove`, `GET .../role/user/:id`)
- User direct permission overrides (`POST .../users/permission/assign`, `POST .../users/permission/remove`, `GET .../users/permissions/:id`)

**Rationale:** Complete coverage of Section 3 of `API_REQUESTS_SUMMARY.md`.

## Risks / Trade-offs

- **[Risk] Existing UI components may fail if method names or parameter shapes change**  
  → **Mitigation:** Provide backward-compatible wrapper signatures or update call sites in the same change step, followed by running `npm run build` or `next build` to verify 100% type safety.
- **[Risk] Mock adapter falling out of sync with new endpoint paths**  
  → **Mitigation:** Update `resolveMockRequest` in `src/lib/api/mock/adapter.ts` to match all new URLs (`/deployments`, `/projects/:id/repository/*`, `/projects/:id/env-vars/*`, etc.) with mock handlers.

## Migration Plan
1. Update `src/lib/api/types.ts` with aligned DTOs and envelopes.
2. Update existing hooks in `src/lib/hooks/api/` (`useProjects.ts`, `useDeployments.ts`, `useProjectRepo.ts`, `useEnvVars.ts`, `useProjectAccess.ts`, `useNotifications.ts`, `useDashboard.ts`).
3. Add `src/lib/hooks/api/useAccessControl.ts` for RBAC.
4. Update UI call sites (e.g. wizard, repo page, env-vars page, deployments console).
5. Update `src/lib/api/mock/adapter.ts` and `src/lib/api/mock/seeds.ts`.
6. Run `pnpm build` (or `npm run build`) to ensure type check and build pass.
