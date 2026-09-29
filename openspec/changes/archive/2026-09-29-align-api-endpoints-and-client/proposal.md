# Proposal: Align API Endpoints and Client with OpenAPI Specification

## Why
The frontend API client, data models, and hook endpoints currently have discrepancies with the backend OpenAPI specification documented in `docs/api/openapi.yaml` and `docs/api/API_REQUESTS_SUMMARY.md` (e.g., mismatched paths for deployments, environment variables, notifications, project access, repository sub-actions, and response envelopes). Aligning the frontend transport layer, React Query hooks, and mock fallback handlers with the official OpenAPI contract is required to ensure reliable end-to-end integration and seamless operation against the Axum backend.

## What Changes
- **API Response Envelope & DTOs**: Update `src/lib/api/types.ts` to strictly mirror the OpenAPI 3.0 schemas, including standard envelope `{ message, data }`, pagination format `{ message, data, pagination: { page, limit, total } }`, and structured error envelope `{ is_error, code, message, errors }`.
- **Deployments & Logs Endpoints**:
  - Align deployment creation to `POST /api/v1/deployments` with `{ project_id, branch, commit_hash, environment }`.
  - Align deployment detail to `GET /api/v1/deployments/:id`.
  - Add hooks for `POST /api/v1/deployments/:id/redeploy` and `POST /api/v1/projects/:id/rollback`.
  - Align logs querying to `GET /api/v1/deployments/:id/logs`, `GET /api/v1/deployments/:id/logs/search`, `GET /api/v1/deployments/:id/logs/download`, and `GET /api/v1/deployments/:id/logs/stream`.
- **Repository Sub-Module Endpoints**:
  - Add hooks for `POST /api/v1/projects/:id/repository/validate` (test credentials & git URL), `POST /api/v1/projects/:id/repository/clone`, `GET /api/v1/projects/:id/repository/commit`, `PUT /api/v1/projects/:id/repository/branch`, and `GET /api/v1/projects/:id/repository/branches`.
- **Environment Variables Endpoints**:
  - Replace legacy full-array PUT with `POST /api/v1/projects/:id/env-vars`, `POST /api/v1/projects/:id/env-vars/bulk`, `PUT /api/v1/projects/:id/env-vars/:env_id`, `DELETE /api/v1/projects/:id/env-vars/:env_id`, and `GET /api/v1/projects/:id/env-vars/decrypt`.
- **Project Members & Teams Assignment Endpoints**:
  - Align project assignments to `GET|POST /api/v1/projects/:id/members`, `DELETE /api/v1/projects/:id/members/:user_id`, and `GET|POST /api/v1/projects/:id/teams`, `DELETE /api/v1/projects/:id/teams/:team_id`.
- **Notifications Endpoints**:
  - Align mark-all-read to `PATCH /api/v1/notifications/read-all` (formerly POST `/mark-all-read`).
  - Add hooks for `GET /api/v1/notifications/unread-count`, `DELETE /api/v1/notifications/:id`, and SSE stream `GET /api/v1/notifications/stream`.
- **Dashboard & Health Endpoints**:
  - Align dashboard endpoints to `GET /api/v1/dashboard` (admin), `GET /api/v1/dashboard/user`, and `GET /api/v1/dashboard/org/:org_id`.
  - Add probes `GET /api/v1/health/live`, `GET /api/v1/health/ready`, and `GET /api/v1/health/deep`.
- **Access Control (RBAC) Module**:
  - Introduce API client functions and hooks for roles, permissions, role-permission assignments, and user-role/permission assignments (`/api/v1/access-control/*`).
- **Mock Adapter & Fallback Engine**:
  - Update `src/lib/api/mock/adapter.ts` and `src/lib/api/mock/seeds.ts` to route all OpenAPI-compliant URLs and responses so mock/offline development continues working without regressions.

## Capabilities

### New Capabilities
- `access-control`: Comprehensive RBAC management hooks, DTOs, and services covering system roles, atomic permissions, role-permission mappings, and direct user assignments in accordance with `/api/v1/access-control/*`.

### Modified Capabilities
- `api-transport`: Update core DTO definitions, response envelope structures, pagination formats, and error handling to strictly conform to the OpenAPI 3.0 specification in `docs/api/openapi.yaml`.
- `domain-modules`: Update endpoint URLs, request payload signatures, and hooks for Projects, Repositories, Environment Variables, Deployments, Logs, Organizations, Teams, Notifications, Dashboard, and Health to match the OpenAPI routes.

## Impact
- **Affected Code**: `src/lib/api/types.ts`, `src/lib/api/client.ts`, `src/lib/api/mock/adapter.ts`, `src/lib/api/mock/seeds.ts`, and all hook files under `src/lib/hooks/api/`.
- **Pages & Components**: Existing pages referencing old hook methods (such as project repository, env-vars, deployments, and access management) will be updated to consume the aligned hook interfaces.
- **Dependencies**: No external dependencies added; utilizes existing Axios, TanStack React Query, and Zod dependencies.
