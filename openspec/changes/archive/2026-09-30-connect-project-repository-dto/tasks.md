# Tasks

## 1. Type Definitions & API Client

- [x] 1.1 Add `ConnectProjectRepositoryDTO` and update `SaveRepositoryRequest` in `src/lib/api/types.ts` to strictly require `repository_url: string`, with optional `access_token?: string | null` and `default_branch?: string | null`, and verify TypeScript exports without syntax errors.
- [x] 1.2 Update `saveProjectRepository` and `updateProjectRepository` in `src/lib/api/client.ts` to send `ConnectProjectRepositoryDTO` payloads.

## 2. Hooks & Components Integration

- [x] 2.1 Update `useSaveProjectRepository` and `useUpdateProjectRepository` in `src/lib/hooks/api/useProjectRepo.ts` to accept `ConnectProjectRepositoryDTO` and pass `{ repository_url, default_branch, access_token }` to the API client, verifying mock fallbacks retain matching shapes.
- [x] 2.2 Update `NewProjectWizard.tsx` repository submission in Step 2 / final submission to cleanly pass `{ repository_url, default_branch, access_token }` conforming to `ConnectProjectRepositoryDTO`.
- [x] 2.3 Verify and update any remaining repository settings forms or callers (e.g. project repository detail tabs or mock tests) to use the new field names.

## 3. Verification & Build

- [x] 3.1 Run TypeScript type checking (`pnpm tsc --noEmit`) to verify there are no type discrepancies or lingering `repo_url`/`auth_token` mismatches.
- [x] 3.2 Run frontend production build (`pnpm build`) to verify clean compilation.
