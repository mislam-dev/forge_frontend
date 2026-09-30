# Design

## Context

See `proposal.md` for motivation. The Forge platform frontend interacts with backend services defined in `docs/api/openapi.yaml`. The health probe endpoints `/health/live`, `/health/ready`, and `/health/deep` provide process liveliness, dependency readiness, and deep aggregated diagnostics. The existing frontend code has schema mismatches in `src/lib/api/types.ts` and does not handle unwrapped direct probe payloads or the HTTP 503 readiness status.

## Goals / Non-Goals

**Goals:**
- Provide TypeScript definitions matching the OpenAPI specification for all three health check endpoints (`HealthLiveDTO`, `HealthReadyDTO`, `HealthCheckItem`, `HealthDeepDTO`).
- Update React Query hooks in `src/lib/hooks/api/useDashboard.ts` with support for unwrapped responses, HTTP 503 readiness handling, and `timeout_ms` parameter in `useHealthDeep`.
- Update dashboard status indicator in `src/app/(dashboard)/dashboard/page.tsx` to handle both `healthy` and `ready` statuses.
- Render deep health and dependency diagnostic checks in the System Administration view.

**Non-Goals:**
- Modifying backend server probe implementation.
- Altering existing non-health dashboard queries or domain modules.

## Decisions

### Decision 1: Safe Payload Extraction (`(res as any).data ?? res`)
- **Rationale**: While standard business endpoints return `{ message: string, data: T }`, health probes in OpenAPI return direct JSON payloads (e.g. `{ status: "healthy", service: "forge-platform", ... }`). Using `(res as any).data ?? res` safely extracts the payload whether wrapped by middleware or returned raw.
- **Alternatives Considered**: Modifying global Axios interceptor. Rejected because it would affect all other endpoints expecting the standard response envelope.

### Decision 2: Graceful HTTP 503 Readiness Probe Handling
- **Rationale**: According to the OpenAPI specification, `/health/ready` returns HTTP 503 with a structured body (`{ status: "not_ready", checks: { ... } }`) when dependencies are down. Standard Axios error handling rejects HTTP 503, which would lose the structured `checks` payload. In `useHealthReady` and `useSystemHealth`, we configure `validateStatus: (status) => (status >= 200 && status < 300) || status === 503` (or catch the 503 error response) to return the structured `HealthReadyDTO`.
- **Alternatives Considered**: Letting HTTP 503 throw an unhandled query error. Rejected because the dashboard would show a generic network failure rather than displaying degraded dependency states.

### Decision 3: Status Badge Mapping
- **Rationale**: In `src/app/(dashboard)/dashboard/page.tsx`, `useSystemHealth` queries `/health/ready`. The badge check is updated from `health?.status === 'healthy'` to `health?.status === 'healthy' || health?.status === 'ready'` to match the backend contract.
- **Alternatives Considered**: Switching `useSystemHealth` to `/health/live`. Rejected because liveness only verifies that the web process is listening, whereas readiness verifies database and container runtime availability.

### Decision 4: System Administration Deep Health Panel
- **Rationale**: `/health/deep` is secured with `bearerAuth` and intended for System Admins. Adding a dedicated panel in the System Administration view on `/dashboard` allows administrators to review uptime, version, environment, and latency metrics across internal services.
- **Alternatives Considered**: Creating a separate `/admin/health` page. Keeping it in the System Administration view on `/dashboard` maintains consistency with existing system infrastructure metrics.

## Risks / Trade-offs

- **[Risk] Path prefix divergence (`/health/*` vs `/api/v1/health/*`)**: In OpenAPI the path is `/health/*` under server URL `/api/v1`.
  - **Mitigation**: Use `/api/v1/health/*` in the client hooks, matching all existing endpoints in `src/lib/api/client.ts`.
- **[Risk] Excessive polling overhead**: Frequent polling of deep diagnostic checks could stress backend dependencies.
  - **Mitigation**: Set `refetchInterval: 30000` for deep health checks and enable it only when the System Admin view is active.
