# Tasks

## 1. Remove Deployments List Short Polling

- [x] 1.1 Remove `refetchInterval` polling callback from `useDeploymentsList` in `src/lib/hooks/api/useDeployments.ts` and verify no background queries are scheduled
- [x] 1.2 Inspect `src/app/(dashboard)/projects/[id]/deployments/page.tsx` and `src/app/(dashboard)/projects/[id]/page.tsx` to ensure clean single-fetch loading and manual trigger refresh

## 2. Verification & Type Checking

- [x] 2.1 Run TypeScript type check (`pnpm tsc --noEmit` or `pnpm build`) and verify build succeeds without regressions
