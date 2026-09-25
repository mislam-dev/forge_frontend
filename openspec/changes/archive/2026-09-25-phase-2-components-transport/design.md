# Design: Phase 2 - Reusable Components & API Transport Layer

## Context

Following Phase 1, the repository is structured with source files under `src/`, theme CSS variables in `src/app/globals.css`, and a verified build pipeline. Phase 2 introduces the foundational component hierarchy and client-server transport mechanism that all subsequent screens (auth, project settings, deployments, logs) will consume. See `proposal.md` for overall motivation.

## Goals / Non-Goals

**Goals:**
- Provide 10 standard, accessible UI primitives in `src/components/ui/` based on Radix UI and Tailwind CSS tokens.
- Deliver `FormWrapper` unifying React Hook Form and Zod validation schemas with accessible loading states.
- Deliver domain operational widgets (`StatusBadge`, `EncryptedValueMasker`, `SseLogViewer`, and `DataTable`).
- Establish a singleton Axios instance (`apiClient`) with automatic bearer token attachment, request tracing UUIDs, and automated 401 token refresh queueing.
- Implement `useSseStream` hook for real-time live log consumption with memory-bounded buffers.
- Provide a `QueryProvider` configuring TanStack Query client caching defaults.
- Define complete TypeScript DTOs matching backend Axum OpenAPI specifications.

**Non-Goals:**
- Implementation of full page layouts, sidebars, or routing logic (deferred to Phase 3: Shell, Routing & Auth).
- Implementation of domain-specific feature views such as project creation wizards, deployment trigger modals, or metrics charts (deferred to Phase 4: Modules & Features).
- Replacing SSE with WebSockets (the backend provides SSE for deployment log streaming).

## Decisions

### Decision 1: Direct shadcn/ui Component Implementations
- **Choice**: Implement Radix UI primitive wrappers directly in `src/components/ui/` styled with class-variance-authority (`cva`) and Tailwind CSS rather than installing an external monolithic component library.
- **Rationale**: Gives full ownership over accessibility, DOM structure, and CSS variable binding to our Phase 1 token system (`bg-background`, `border-border`, `text-primary`).
- **Alternatives Considered**: Monolithic UI libraries (e.g. Mantine, Chakra UI), which introduce conflicting style engines and heavier bundle sizes.

### Decision 2: Promise Queue for Concurrent 401 Token Refresh
- **Choice**: When an HTTP 401 response is intercepted, mark `isRefreshing = true` and accumulate subsequent failing requests in a `failedQueue` array of resolver callbacks. Once `/api/v1/auth/refresh` resolves, replay all queued requests with the new token.
- **Rationale**: Prevents multiple parallel queries on a dashboard from hammering the refresh endpoint simultaneously (thundering herd problem).
- **Alternatives Considered**: Direct redirect to `/login` without refresh (degraded UX; users get logged out mid-session), or naive immediate refresh per request (causes race conditions and revoked refresh token rejections).

### Decision 3: Memory-Bounded Ring Buffer for `useSseStream`
- **Choice**: Cap log buffer size in state to a maximum of 5,000 lines, evicting the oldest lines when exceeded.
- **Rationale**: Long build and deployment pipelines can emit tens of thousands of lines; unbounded state arrays degrade rendering performance and can crash browser tabs.
- **Alternatives Considered**: Virtualized rendering without line capping (still retains large memory footprint in JavaScript heap).

### Decision 4: TanStack Query v5 Default Configuration
- **Choice**: Configure `QueryClient` with a default `staleTime` of 30 seconds, `refetchOnWindowFocus: false`, and retry count of 1 for queries, exposed through `src/components/providers/QueryProvider.tsx`.
- **Rationale**: Prevents aggressive background refetching while user is typing or inspecting data, while maintaining cached responses across component mounts.

## Risks / Trade-offs

- **[Package Compatibility with React 19]** → Dependencies (`@radix-ui/*`, `lucide-react`, `react-hook-form`, `zod`, `@tanstack/react-table`, `@tanstack/react-query`) must be verified for compatibility during package installation.
- **[Client vs. Server Component Boundaries]** → Components relying on browser APIs (`localStorage`, `EventSource`, `navigator.clipboard`) or React state/hooks must explicitly declare `"use client"`.
- **[SSE Browser Connection Limits]** → HTTP/1.1 limits EventSource to 6 concurrent connections per domain. Mitigation: Ensure connections are closed when log viewer unmounts via `useEffect` cleanup.
