# Tasks

## 1. Plan Directory Setup & Master Roadmap Index

- [x] 1.1 Create `docs/plan/` folder and author `docs/plan/README.md` containing the overarching phase roadmap, dependency matrix, and status tracking table. Verify markdown renders valid links to all four phase documents.

## 2. Phase 1 & 2 Execution Plans

- [x] 2.1 Author `docs/plan/phase-1-foundations-theme.md` covering Next.js 14 App Router scaffolding, `package.json` dependencies, Tailwind CSS token mappings, HSL variables in `globals.css`, `next-themes` provider, Zustand client stores (`useWorkspaceStore`), and `.env.local`. Verify checklist includes verification commands (`npm run build`, `npm run dev`).
- [x] 2.2 Author `docs/plan/phase-2-components-transport.md` covering shadcn/ui primitives, `FormWrapper` with React Hook Form + Zod, `StatusBadge`, `EncryptedValueMasker`, `DataTable` with `@tanstack/react-table`, `SseLogViewer`, Axios client with 401 token refresh queue, `useSseStream` hook, and TypeScript DTO definitions in `lib/api/types.ts`. Verify contracts match `docs/frontend/02-reusable-components.md` and `docs/frontend/04-api-integration.md`.

## 3. Phase 3 & 4 Execution Plans

- [x] 3.1 Author `docs/plan/phase-3-shell-routing-auth.md` covering `middleware.ts` auth redirection guard, `(auth)` route group (`/login`, `/register`, `/forgot-password`, `/reset-password`), centered card layout, `(dashboard)` shell layout with collapsible sidebar (`w-64` / `w-16`), topbar header (`h-16`), user menu, and breadcrumb navigation. Verify route tree matches `docs/frontend/03-pages-and-routes.md`.
- [x] 3.2 Author `docs/plan/phase-4-modules-features.md` covering all 10 domain modules from `docs/frontend/05-module-specs.md` (Overview Dashboard, User Settings, Organizations & Tenants, Teams, Projects & Environment Variables Editor, Deployments Engine & Real-Time SSE Build Console, and Health Probes). Verify endpoint mappings and mock data fallbacks are specified.

## 4. Verification & Consistency Audit

- [x] 4.1 Perform cross-reference audit verifying all paths, types, and architectural links across `docs/plan/*.md` and `docs/frontend/*.md` align without conflicting instructions.
