# Tasks

## 1. DTO and Type System Updates

- [x] 1.1 Update `HealthLiveDTO` in `src/lib/api/types.ts` to include `service`, `version`, `environment`, and `timestamp`, and verify TypeScript type definitions pass type check.
- [x] 1.2 Define `HealthCheckItem` and update `HealthReadyDTO` in `src/lib/api/types.ts` to model status (`ready` / `not_ready`), timestamp, and dependency check records (`database`, `job_queue`, `container_runtime`), and verify TypeScript compilation.
- [x] 1.3 Update `HealthDeepDTO` in `src/lib/api/types.ts` to match OpenAPI specification fields (`status`, `service`, `version`, `environment`, `uptime_seconds`, `timestamp`), and verify TypeScript compilation.

## 2. API Transport & Query Hooks Integration

- [x] 2.1 Update `useHealthLive` in `src/lib/hooks/api/useDashboard.ts` to unwrap direct JSON payloads safely (`(res as any).data ?? res`), and verify query resolution.
- [x] 2.2 Update `useHealthReady` and `useSystemHealth` in `src/lib/hooks/api/useDashboard.ts` to support unwrapped payloads and handle HTTP 503 responses returning structured `HealthReadyDTO` dependency states, and verify query resolution.
- [x] 2.3 Update `useHealthDeep` in `src/lib/hooks/api/useDashboard.ts` to support the `timeout_ms` query parameter and safe payload extraction, and verify query resolution.

## 3. Dashboard UI & Admin Diagnostics

- [x] 3.1 Update system health indicator in `src/app/(dashboard)/dashboard/page.tsx` to recognize both `healthy` and `ready` as operational states, and verify the "Systems Operational" status badge displays correctly.
- [x] 3.2 Add deep diagnostic health details (service, version, environment, uptime, dependency checks) to the System Administration view in `src/app/(dashboard)/dashboard/page.tsx`, and verify the component renders without errors.

## 4. Verification & Linting

- [x] 4.1 Run `npm run lint` and TypeScript check to verify zero linting and type errors across modified files.
