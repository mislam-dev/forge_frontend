# Tasks

## 1. Project Creation Wizard Persistence & Modal Lifecycle

- [x] 1.1 Update `NewProjectWizard.tsx` to omit `organization_id` (or pass null/undefined) when in personal workspace instead of falling back to `'org-1'`, and verify type compliance with `pnpm tsc --noEmit`.
- [x] 1.2 Update `NewProjectWizard.handleSubmit` to call `POST /api/v1/projects/:id/repository` with repository details after project creation, and verify API payload structure.
- [x] 1.3 Update `NewProjectWizard.handleSubmit` to call `POST /api/v1/projects/:id/env-vars/bulk` (or single `/env-vars`) to persist all declared environment variables to the server.
- [x] 1.4 Wire `onSuccess` callback and dismiss the intercepted modal route in `@modal/(.)projects/new/page.tsx` upon successful creation before navigating to the project overview page.

## 2. Project Access Controls & Navigation Scoping

- [x] 2.1 Refactor `src/app/(dashboard)/projects/[id]/access/page.tsx` to remove team assignment options, restricting project access solely to user collaborators with designated roles (`admin`, `developer`, `viewer`).
- [x] 2.2 Update `src/components/projects/ProjectHeader.tsx` to rename the access navigation tab from "Access & Teams" to "Access Control".
- [x] 2.3 Update `src/components/layout/Sidebar.tsx` to dynamically hide the "Teams" navigation link when `activeOrgId === null` (personal user workspace).
- [x] 2.4 Update `src/app/(dashboard)/dashboard/page.tsx` to hide the "Teams & Access" quick link when in personal user workspace.

## 3. Verification & Build

- [x] 3.1 Run TypeScript typecheck (`pnpm tsc --noEmit`) to verify zero compilation errors across wizard, access, and layout components.
- [x] 3.2 Run Next.js production build (`pnpm build`) to verify bundle compilation and page route generation.
