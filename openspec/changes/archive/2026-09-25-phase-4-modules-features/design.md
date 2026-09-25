# Design

## Context

Phase 1 established Tailwind CSS v4 design tokens and theming. Phase 2 delivered the core component library (`DataTable`, `StatusBadge`, `SseLogViewer`, `EncryptedValueMasker`), HTTP client (`apiClient`), and SSE hook (`useSseStream`). Phase 3 established authenticated route groups, JWT session management, and the `Sidebar`/`Topbar` layout shell.

See `proposal.md` for why Phase 4 is needed. The technical challenge is to deliver 10 domain feature modules with responsive user experiences, TanStack Query data fetching and cache invalidation, live SSE log streaming, and an offline mock fallback layer allowing standalone demonstration.

## Goals / Non-Goals

**Goals:**
- Implement all 10 domain feature modules per `docs/plan/phase-4-modules-features.md` and `docs/frontend/05-module-specs.md`.
- Provide a clean, modular custom React Query hook layer in `src/lib/hooks/api/` with typed query keys and automatic cache invalidation upon mutations.
- Bind `SseLogViewer` to real-time build log streaming at `/projects/[id]/deployments/[depId]`.
- Implement POSIX key validation, bulk `.env` paste, and secret masking in the environment variables editor.
- Create an offline mock data provider and fallback adapter in `src/lib/api/mock/` that enables full development and demonstration without requiring a running Rust backend.
- Ensure strict TypeScript compliance and production webpack build success.

**Non-Goals:**
- Direct database or server-side rendering logic; Next.js is configured as a client-side SPA (`'use client'` page views).
- OAuth provider callbacks (GitHub/GitLab OAuth authorization flows are stubbed or handled via PAT token entry in this phase).
- Third-party payment or billing integration.

## Decisions

### Decision 1: Modular Hook Architecture (`src/lib/hooks/api/`)
- **Approach**: Create dedicated files for each domain entity (`useDashboard.ts`, `useProjects.ts`, `useEnvVars.ts`, `useDeployments.ts`, `useOrganizations.ts`, `useTeams.ts`, `useNotifications.ts`, `useUserProfile.ts`).
- **Rationale**: Keeps query keys scoped (`['projects']`, `['projects', id]`, `['deployments', projectId]`), centralizes cache invalidation upon mutations, and decouples page views from direct `apiClient` calls.
- **Alternatives Considered**: Direct inline `useQuery` calls in page files (violates separation of concerns and leads to duplicated query keys and invalidation logic).

### Decision 2: Offline Mock Adapter & Automatic Network Fallback
- **Approach**: In `src/lib/api/mock/`, implement realistic seed fixtures conforming to OpenAPI contracts (`seeds.ts`) and a mock request resolver (`adapter.ts`). If `NEXT_PUBLIC_ENABLE_MOCKS=true` or if an HTTP request encounters a network failure (`ECONNREFUSED` / failed to fetch), the client falls back to mock responses. For SSE, provide a browser-side log simulation if the SSE stream endpoint is unreachable.
- **Rationale**: Allows developers, reviewers, and CI environments to navigate and test all 10 domain views seamlessly without running the backend Axum service.
- **Alternatives Considered**: Requiring MSW (Mock Service Worker), which introduces service worker registration complexity and build pipeline friction in Next.js 16. A lightweight client-level fallback adapter is zero-dependency and reliable.

### Decision 3: Project Detail Sub-Navigation Architecture
- **Approach**: Under `src/app/(dashboard)/projects/[id]/`, organize tabs for Overview, Deployments, Environment Variables, Repository Settings, and Access Control. Sub-pages share common breadcrumbs and project metadata headers.
- **Rationale**: Matches the specification in `docs/frontend/03-pages-and-routes.md` and provides clean, bookmarkable URLs (`/projects/[id]/env-vars`, `/projects/[id]/deployments`).
- **Alternatives Considered**: Single giant page with client-side tabs (hurts deep-linking and browser navigation history).

### Decision 4: Environment Variables Handling & Secret Masking
- **Approach**: Store raw key/value pairs in component state, enforce POSIX regex `^[A-Z_][A-Z0-9_]*$` on key entry, support parsing multiline `KEY=VALUE` strings for bulk import, and wrap secret values with `EncryptedValueMasker`.
- **Rationale**: Matches industrial standards (e.g. Vercel, Railway, GitHub Actions secrets) while leveraging our Phase 2 masked UI component.
- **Alternatives Considered**: Plain input fields without masking (security risk for screen sharing and shoulder-surfing).

### Decision 5: Live SSE Console Integration
- **Approach**: On `/projects/[id]/deployments/[depId]/page.tsx`, use `useSseStream` pointing to `/api/v1/projects/:id/deployments/:depId/logs/stream`. Feed streamed lines directly into `SseLogViewer`. Provide a fallback timer emitter when offline/mocking that emits realistic build steps ("Cloning repository...", "Compiling crates...", "Generating container image...", "Deployment finished successfully").
- **Rationale**: Delivers a high-fidelity terminal console with auto-scroll, ANSI parsing, and fullscreen mode.

## Risks / Trade-offs

- **[Risk] Large surface area with 10 modules causing TypeScript or route mismatches**:
  → *Mitigation*: Strictly type DTOs against `docs/frontend/05-module-specs.md` and verify typechecking with `tsc --noEmit` and production build with `pnpm exec next build --webpack` during each task group.
- **[Risk] State desynchronization between Workspace Org and Project Views**:
  → *Mitigation*: Subscribe to `useWorkspaceStore` in project hooks to automatically pass `activeOrgId` into queries and update when the user switches tenant in the sidebar.
- **[Risk] Form validation inconsistencies across creation wizards and editors**:
  → *Mitigation*: Use shared Zod schemas and validation helpers for project creation, environment variable syntax, and password updates.
