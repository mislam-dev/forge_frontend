# Proposal

## Why

The frontend currently uses outdated and inconsistent interfaces for health checks (`HealthLiveDTO`, `HealthReadyDTO`, `HealthDeepDTO`, and `HealthStatusDTO`), which do not match the backend OpenAPI 3.0 specification for the `/health/live`, `/health/ready`, and `/health/deep` probe endpoints. In particular, the OpenAPI contracts return direct JSON objects (without generic API response envelopes), `/health/ready` emits dependency-level latency checks (`database`, `job_queue`, `container_runtime`) with HTTP 200/503 status codes, and `/health/deep` requires Bearer authentication and accepts a `timeout_ms` parameter. Aligning the client transport, DTOs, query hooks, and dashboard status indicators with the OpenAPI specification ensures accurate platform observability and prevents runtime deserialization failures.

## What Changes

- **Align Health Check DTOs**:
  - Update `HealthLiveDTO` to represent liveness probe response: `{ status: string, service: string, version: string, environment: string, timestamp: string }`.
  - Introduce `HealthCheckItem`: `{ status: 'healthy' | 'unhealthy' | string, latency_ms: number | null, message?: string }`.
  - Update `HealthReadyDTO` to represent readiness probe responses (HTTP 200/503): `{ status: 'ready' | 'not_ready' | string, service: string, timestamp: string, checks: { database: HealthCheckItem, job_queue: HealthCheckItem, container_runtime: HealthCheckItem, [key: string]: HealthCheckItem | undefined } }`.
  - Update `HealthDeepDTO` to represent deep health check response: `{ status: string, service: string, version: string, environment: string, uptime_seconds: number, timestamp: string }`.
- **API Client & Query Hook Integration**:
  - Update `useHealthLive`, `useHealthReady`, `useHealthDeep`, and `useSystemHealth` in `src/lib/hooks/api/useDashboard.ts` to properly handle unwrapped responses (`res.data ?? res`).
  - Add `timeout_ms` query parameter support to `useHealthDeep({ timeout_ms?: number, enabled?: boolean })`.
  - Handle HTTP 503 response from `/health/ready` cleanly in `useHealthReady` and `useSystemHealth` without breaking UI render state.
- **Dashboard Health Status Display**:
  - Update status evaluation in `src/app/(dashboard)/dashboard/page.tsx` so that `status === 'healthy'` and `status === 'ready'` are both recognized as operational.
  - Surface detailed dependency checks (`database`, `job_queue`, `container_runtime`) and probe diagnostics in the System Administration view.

## Capabilities

### Modified Capabilities
- `api-transport`: Update `Typed API and Domain Data Transfer Objects` and `Standardized Route Prefix and API Client Configuration` to strictly align health probe DTOs (`HealthLiveDTO`, `HealthReadyDTO`, `HealthCheckItem`, `HealthDeepDTO`) and transport parsing with the `/health/live`, `/health/ready`, and `/health/deep` OpenAPI contracts.
- `domain-modules`: Update `Overview Dashboard Metrics & System Health` to specify health probe query integration, status interpretation (`ready` / `healthy` vs `not_ready` / 503), and system administrative probe visibility.

## Impact

- `src/lib/api/types.ts`: Update `HealthLiveDTO`, `HealthReadyDTO`, `HealthDeepDTO`, and add `HealthCheckItem`.
- `src/lib/hooks/api/useDashboard.ts`: Update query hooks `useHealthLive`, `useHealthReady`, `useHealthDeep`, and `useSystemHealth` for unwrapped responses, 503 readiness handling, and timeout query parameter.
- `src/app/(dashboard)/dashboard/page.tsx`: Update health status badge condition and system admin probe monitoring.
