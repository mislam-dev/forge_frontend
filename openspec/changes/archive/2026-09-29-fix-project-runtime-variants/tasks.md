# Tasks

## 1. Types & Validation

- [x] 1.1 Update `ProjectRuntime` (`NodeJs | Python | Go | Static`) and `ProjectType` (`Repo | Files`) in `src/lib/api/types.ts` to strictly match backend Serde enum contracts, and verify exports compile without type errors.
- [x] 1.2 Update `projectStep1Schema` in `src/lib/validation/projects.ts` to validate backend-supported runtime and type enums, and verify schemas accept PascalCase variants (`NodeJs`, `Python`, `Go`, `Static`, `Repo`) and reject invalid strings.

## 2. Project Wizard & Header UI

- [x] 2.1 Update `src/components/projects/NewProjectWizard.tsx` runtime selector options, initial form values, and submission payload to use `NodeJs`, `Python`, `Go`, `Static` and `Repo`, and verify form submission serializes PascalCase values.
- [x] 2.2 Update `src/components/projects/ProjectHeader.tsx` runtime badge rendering and icon/label mappings for `NodeJs`, `Python`, `Go`, `Static`, and verify badge displays human-readable labels correctly.

## 3. Project Listing & Filter UI

- [x] 3.1 Update runtime filter buttons and card badge rendering in `src/app/(dashboard)/projects/page.tsx` to use `NodeJs`, `Python`, `Go`, `Static`, and verify filtering by runtime works seamlessly.

## 4. Mock Adapter & Seeds Parity

- [x] 4.1 Update mock seed projects in `src/lib/api/mock/seeds.ts` and runtime defaults in `src/lib/api/mock/adapter.ts` to use `NodeJs`, `Python`, `Go`, `Static` and `Repo`, and verify mock projects conform to the updated types.

## 5. Verification & Build

- [x] 5.1 Run `pnpm exec tsc --noEmit` and verify zero TypeScript compilation errors.
- [x] 5.2 Run `pnpm build` and verify the Next.js production build succeeds with zero errors.
