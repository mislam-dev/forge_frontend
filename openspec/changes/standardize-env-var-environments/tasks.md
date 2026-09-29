# Tasks

## 1. Type Definitions

- [x] 1.1 Add `ProjectEnvironment` union type (`'development' | 'production' | 'staging'`) in `src/lib/api/types.ts` and update `EnvironmentVariableDTO`, `CreateEnvVarRequest`, `ProjectEnvVarItemDTO`, and `SaveEnvVarItem`.

## 2. Wizard & Editor Scope Updates

- [x] 2.1 Update `NewProjectWizard.tsx` to default new rows to `'production'`, restrict dropdown options to `Production`, `Staging`, and `Development`, and normalize serialized environment values to lowercase `'development' | 'production' | 'staging'`.
- [x] 2.2 Update `src/app/(dashboard)/projects/[id]/env-vars/page.tsx` to remove `'all'` and `'preview'` options from variable rows and bulk import defaults, restricting selectable environments to `Production`, `Staging`, and `Development`.

## 3. Verification & Build

- [x] 3.1 Run TypeScript typecheck (`pnpm tsc --noEmit`) to verify zero compilation errors across types, wizard, hooks, and pages.
- [x] 3.2 Run Next.js production build (`pnpm build`) to verify bundle compilation and page route generation.
