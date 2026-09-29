# Tasks

## 1. Type Definitions & Schema Alignment

- [x] 1.1 Update `ProjectEnvironment` in `src/lib/api/types.ts` to `'Development' | 'Production' | 'Staging'` matching backend Serde enum variants.

## 2. Wizard & Editor Casing Updates

- [x] 2.1 Update `NewProjectWizard.tsx` to default new rows to `'Production'`, use PascalCase dropdown options, and map serialized environments to `'Development' | 'Production' | 'Staging'`.
- [x] 2.2 Update `src/app/(dashboard)/projects/[id]/env-vars/page.tsx` to default new rows and bulk imports to `'Production'`, use PascalCase dropdown options, and normalize incoming server strings to PascalCase.

## 3. Verification & Build

- [x] 3.1 Run TypeScript typecheck (`pnpm tsc --noEmit`) to verify zero compilation errors.
- [x] 3.2 Run Next.js production build (`pnpm build`) to verify clean bundle compilation.
