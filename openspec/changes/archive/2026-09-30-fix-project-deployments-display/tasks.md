# Tasks

## 1. API Hook Envelope Parsing

- [x] 1.1 Update `useDeploymentsList` in `src/lib/hooks/api/useDeployments.ts` to support `PaginatedData<DeploymentDTO>` by extracting `res.data.data` when present, in addition to direct array and `items` structures. Verify type alignment with `ApiResponse<DeploymentDTO[] | PaginatedData<DeploymentDTO> | PaginatedResponse<DeploymentDTO>>`.
- [x] 1.2 Review `useProjectsList` in `src/lib/hooks/api/useProjects.ts` to ensure consistent unwrapping of nested paginated data structures. Verify that hook types and data unwrapping handle both arrays and paginated responses cleanly.

## 2. Deployment Views and Presentation Fallbacks

- [x] 2.1 Update `src/app/(dashboard)/projects/[id]/deployments/page.tsx` to render deployment identifier using `dep.deployment_number ? #${dep.deployment_number} : #${dep.id.slice(0, 8)}`, commit reference using `dep.commit_hash || dep.commit_sha || 'HEAD'`, and display `dep.error_message` for failed deployments. Verify with mock records containing UUIDs, missing sequence numbers, and failure messages.
- [x] 2.2 Update `src/app/(dashboard)/projects/[id]/page.tsx` Latest Deployment card to fall back to `latestDeployment.id.slice(0, 8)` when `deployment_number` is missing, support `commit_hash`, and surface error messages when status is `Failed`. Verify card layout and responsiveness.
- [x] 2.3 Update `src/app/(dashboard)/projects/[id]/deployments/[depId]/page.tsx` console page header to display `#{deployment?.deployment_number ?? deployment?.id?.slice(0, 8) ?? '...'}` and surface `deployment.error_message` in a diagnostic alert banner when a deployment has failed. Verify console page display.

## 3. Verification & Type Safety

- [x] 3.1 Run type-check / build (`pnpm build` or `npm run type-check`) to verify strict type correctness across all modified files and hooks.
- [x] 3.2 Run test suite (`npm test` / `pnpm test`) to ensure no regressions in existing dashboard and deployment unit tests.
