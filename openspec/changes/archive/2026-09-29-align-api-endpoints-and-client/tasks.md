# Tasks

## 1. API Types & Response Envelope Alignment

- [x] 1.1 Update `src/lib/api/types.ts` to define OpenAPI 3.0 standard response envelopes (`ApiResponse<T>`, `ApiPaginatedResponse<T>`, `ApiErrorResponse`) and verify type exports
- [x] 1.2 Update DTOs in `src/lib/api/types.ts` for projects, deployments, repositories, environment variables, notifications, dashboard, and access-control roles/permissions to match `docs/api/openapi.yaml`

## 2. API Client & Transport Layer

- [x] 2.1 Update `src/lib/api/client.ts` to standardize on `/api/v1` routes and preserve structured error payloads (`is_error`, `code`, `errors`) on rejection
- [x] 2.2 Verify Axios interceptors correctly handle token refresh and offline mock resolution with the new envelope shapes

## 3. Deployments & Build Logs Hooks

- [x] 3.1 Update `src/lib/hooks/api/useDeployments.ts` to align `POST /api/v1/deployments` (trigger with project_id), `GET /api/v1/deployments/:id` (detail), `GET /api/v1/projects/:id/deployments` (history), `POST /api/v1/deployments/:id/redeploy`, and `POST /api/v1/projects/:id/rollback`
- [x] 3.2 Add query hooks in `useDeployments.ts` for stored logs (`GET /api/v1/deployments/:id/logs`), keyword search (`GET /api/v1/deployments/:id/logs/search`), and raw download (`GET /api/v1/deployments/:id/logs/download`)

## 4. Repository & Environment Variables Hooks

- [x] 4.1 Update `src/lib/hooks/api/useProjectRepo.ts` with hooks for validate (`POST .../repository/validate`), save (`POST .../repository`), clone (`POST .../repository/clone`), latest commit (`GET .../repository/commit`), switch branch (`PUT .../repository/branch`), and remote branches (`GET .../repository/branches`)
- [x] 4.2 Update `src/lib/hooks/api/useEnvVars.ts` with granular hooks for create (`POST .../env-vars`), bulk upsert (`POST .../env-vars/bulk`), update (`PUT .../env-vars/:env_id`), delete (`DELETE .../env-vars/:env_id`), and decrypt (`GET .../env-vars/decrypt`)

## 5. Project Access & Notifications Hooks

- [x] 5.1 Update `src/lib/hooks/api/useProjectAccess.ts` to use separate endpoints for project members (`/api/v1/projects/:id/members`) and team assignments (`/api/v1/projects/:id/teams`)
- [x] 5.2 Update `src/lib/hooks/api/useNotifications.ts` to align `PATCH /api/v1/notifications/read-all`, `GET /api/v1/notifications/unread-count`, and `DELETE /api/v1/notifications/:id`

## 6. Access Control (RBAC) & Dashboard Hooks

- [x] 6.1 Create `src/lib/hooks/api/useAccessControl.ts` supporting system roles, granular permissions, role-permission assignments, and user-role/permission overrides
- [x] 6.2 Update `src/lib/hooks/api/useDashboard.ts` to align `GET /api/v1/dashboard` (admin), `GET /api/v1/dashboard/user`, `GET /api/v1/dashboard/org/:org_id`, and health probes (`/health/live`, `/health/ready`, `/health/deep`)

## 7. Mock Adapter & Offline Seeds Synchronization

- [x] 7.1 Update `src/lib/api/mock/seeds.ts` with mock data for remote branches, commit metadata, log search results, and access control roles/permissions
- [x] 7.2 Update `src/lib/api/mock/adapter.ts` to route all new OpenAPI endpoints and wrap results in standard OpenAPI response envelopes

## 8. Consumer Pages Adaptation & Build Verification

- [x] 8.1 Update consumer pages and dialogs (`NewProjectWizard`, `repository/page.tsx`, `env-vars/page.tsx`, `access/page.tsx`, `deployments/[depId]/page.tsx`, `Topbar.tsx`) to consume the aligned hook interfaces without errors
- [x] 8.2 Run TypeScript check and project build to verify 100% type safety and successful Next.js build
