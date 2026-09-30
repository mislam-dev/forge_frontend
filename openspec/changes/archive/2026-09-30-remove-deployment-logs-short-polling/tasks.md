# Tasks

## 1. Remove Deployment Short Polling

- [x] 1.1 Remove `refetchInterval` polling logic from `useDeploymentDetail` in `src/lib/hooks/api/useDeployments.ts` and verify no periodic queries are scheduled for deployment details
- [x] 1.2 Inspect `src/app/(dashboard)/projects/[id]/deployments/[depId]/page.tsx` to ensure clean rendering with single-fetch deployment metadata and SSE log streaming without runtime errors

## 2. Verification & Type Checking

- [x] 2.1 Run TypeScript type check (`pnpm tsc --noEmit` or `pnpm build`) and verify no compiler or lint regressions
