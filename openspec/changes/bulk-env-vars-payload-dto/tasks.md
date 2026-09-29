# Tasks

## 1. Type Definitions & DTO Alignment

- [x] 1.1 Define `ProjectEnvVarItemDTO` and `BulkCreateProjectEnvVarDTO` in `src/lib/api/types.ts` strictly matching the Rust backend schema, and verify type validity.

## 2. API Mutation Hooks & Wizard Payload Updates

- [x] 2.1 Update `useBulkCreateEnvVars` in `src/lib/hooks/api/useEnvVars.ts` to transmit `{ vars: items }` conforming to `BulkCreateProjectEnvVarDTO`.
- [x] 2.2 Update `useSaveEnvVars` in `src/lib/hooks/api/useEnvVars.ts` to post `{ vars: payload.variables }` to `/api/v1/projects/:id/env-vars/bulk`.
- [x] 2.3 Update `src/components/projects/NewProjectWizard.tsx` to transmit `{ vars: formattedVars }` when posting initial variables to `/api/v1/projects/:id/env-vars/bulk`.

## 3. Verification & Build

- [x] 3.1 Run TypeScript typecheck (`pnpm tsc --noEmit`) to verify zero compilation errors across types, hooks, wizard, and project settings pages.
- [x] 3.2 Run Next.js production build (`pnpm build`) to verify production bundle generation.
