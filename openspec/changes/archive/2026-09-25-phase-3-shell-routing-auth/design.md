# Design: Phase 3 - Layout Shell, Routing Architecture & Auth Guards

## Context

Following Phase 1 (foundation tokens) and Phase 2 (components and transport), the project has established UI primitives in `src/components/ui/`, form wrappers in `src/components/shared/form/`, and `useWorkspaceStore` in `src/lib/store/useWorkspaceStore.ts`. Phase 3 constructs the routing hierarchy, Next.js Edge Middleware protection, public authentication pages, and the primary dashboard shell. See `proposal.md` for background motivation.

## Goals / Non-Goals

**Goals:**
- Implement root Next.js Edge Middleware (`src/middleware.ts`) guarding private routes with cookie checks and query redirect handling.
- Deliver the `(auth)` route group (`/login`, `/register`, `/forgot-password`, `/reset-password`) wrapped in a centered card layout.
- Deliver the `(dashboard)` route group and layout shell composed of `Sidebar`, `Topbar`, `Breadcrumbs`, and `UserNav`.
- Connect `Sidebar` directly to `useWorkspaceStore` for collapsible animation (`256px` to `64px`) and tenant organization switching.
- Provide route-level `loading.tsx` skeleton and `error.tsx` boundary with retry capability.

**Non-Goals:**
- Domain feature page implementations (Project wizards, deployment detail, environment variable editors) — deferred to Phase 4.
- Third-party OAuth2/SAML SSO integrations (standard email/password flows are implemented in Phase 3).

## Decisions

### Decision 1: Dual Cookie & LocalStorage Token Management
- **Choice**: Upon successful login, the client writes the access token to `localStorage` (for `apiClient` Bearer token injection) AND writes a `forge_access_token` cookie. On logout, both are cleared.
- **Rationale**: Next.js Edge Middleware operates on the edge runtime before page rendering and can only inspect HTTP cookies, not `localStorage`. Storing the token in both places satisfies both edge routing checks and client-side Axios interceptors.
- **Alternatives Considered**: Session cookies only with Next.js API route proxies (introduces unnecessary server proxy latency for all REST calls), or client-only routing guards (causes layout flash before redirect).

### Decision 2: App Router Route Groups `(auth)` and `(dashboard)`
- **Choice**: Utilize Next.js route groups `src/app/(auth)/` and `src/app/(dashboard)/`.
- **Rationale**: Enables completely distinct layout trees (centered branding card for auth vs. full application shell with sidebar for dashboard) while keeping URLs clean and flat (`/login`, `/dashboard`).
- **Alternatives Considered**: Conditional rendering within a single root layout (complex conditional logic and potential hydration mismatches).

### Decision 3: Client-Side Sidebar Animation with Zustand
- **Choice**: The `Sidebar` component declares `"use client"` and reads `isSidebarCollapsed` and `toggleSidebar` from `useWorkspaceStore`. Width changes are animated via CSS transition classes (`transition-all duration-300 w-64` vs `w-16`).
- **Rationale**: Guarantees instant UI response without server round-trips, with state persisted across browser sessions via Zustand's `persist` middleware.

### Decision 4: Dynamic Breadcrumb Generation from Pathname
- **Choice**: `Breadcrumbs.tsx` uses `usePathname()` from `next/navigation`, splitting on `/` to build an interactive trail with title-cased labels and Chevron separators.
- **Rationale**: Zero manual breadcrumb registration needed across future page additions; all nested routes automatically receive navigation trails.

## Risks / Trade-offs

- **[Cookie & Storage Desynchronization]** → If a user clears cookies manually but retains `localStorage`, middleware might redirect to `/login` while client storage still holds tokens. Mitigation: In `middleware.ts` and `client.ts`, ensure 401 interceptors and auth guards purge both storage layers.
- **[Edge Middleware Matcher Exclusions]** → Middleware must explicitly exclude static Next.js assets (`_next/static`, `_next/image`, `favicon.ico`) to avoid unnecessary edge invocations and performance degradation.
