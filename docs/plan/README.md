# Forge Platform — Frontend Phased Implementation Roadmap

> **Target Platform:** Next.js 14+ App Router · TypeScript 5.x · Tailwind CSS · shadcn/ui · TanStack Query v5  
> **Source Specifications:** [`docs/frontend/`](../frontend/README.md)  
> **Status:** Planning Completed / Implementation Staged  
> **Date:** September 2026  

---

## 1. Executive Summary

This directory (`docs/plan/`) provides a structured, four-phase execution roadmap for building the Forge Platform Web Dashboard. Each phase is self-contained with actionable file manifests, code contracts, reference links to authoritative technical specs in `docs/frontend/`, and concrete verification gates.

---

## 2. Phase Architecture & Execution Sequence

Implementation must proceed strictly in dependency order:

```
+--------------------------------------------------------------------------+
| Phase 1: Foundations, Tooling & Design System Tokens                     |
| Document: docs/plan/phase-1-foundations-theme.md                         |
| Scope: Next.js 14 setup, Tailwind tokens, HSL CSS variables,             |
|        next-themes provider, Zustand stores, and base environment        |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| Phase 2: Core Components, Form Engine & Data Transport                   |
| Document: docs/plan/phase-2-components-transport.md                      |
| Scope: shadcn/ui primitives, FormWrapper, StatusBadge, EncryptedMasker,   |
|        DataTable, SseLogViewer, Axios client, token refresh, and types   |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| Phase 3: Layout Shell, Routing Architecture & Auth Guards                |
| Document: docs/plan/phase-3-shell-routing-auth.md                        |
| Scope: middleware.ts auth guard, (auth) layouts & forms,                 |
|        (dashboard) shell with collapsible sidebar, topbar, & breadcrumbs |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| Phase 4: Domain Modules, Feature Views & Live SSE Streaming              |
| Document: docs/plan/phase-4-modules-features.md                          |
| Scope: 10 domain modules (Overview, Orgs, Teams, Projects, Env Vars,     |
|        Deployments History, Real-Time SSE Build Console, User Profile)   |
+--------------------------------------------------------------------------+
```

---

## 3. Phase Directory & Document Index

| Phase | Plan Document | Primary Focus | Authoritative Spec References |
|---|---|---|---|
| **Phase 1** | [Phase 1: Foundations & Theme](./phase-1-foundations-theme.md) | Next.js 14 bootstrap, Tailwind tokens, CSS vars, `next-themes`, Zustand stores | [`01-design-system.md`](../frontend/01-design-system.md), [`06-project-setup-and-tooling.md`](../frontend/06-project-setup-and-tooling.md) |
| **Phase 2** | [Phase 2: Components & Transport](./phase-2-components-transport.md) | shadcn/ui primitives, Form Engine, StatusBadge, SseLogViewer, Axios client, DTOs | [`02-reusable-components.md`](../frontend/02-reusable-components.md), [`04-api-integration.md`](../frontend/04-api-integration.md) |
| **Phase 3** | [Phase 3: Shell, Routing & Auth](./phase-3-shell-routing-auth.md) | Auth middleware, `(auth)` pages, `(dashboard)` layout, Collapsible Sidebar, Topbar | [`03-pages-and-routes.md`](../frontend/03-pages-and-routes.md) |
| **Phase 4** | [Phase 4: Domain Modules & Features](./phase-4-modules-features.md) | 10 domain module pages, React Query hooks, live build console SSE stream | [`05-module-specs.md`](../frontend/05-module-specs.md) |

---

## 4. Phase Verification Matrix

Before advancing to a subsequent phase, all exit criteria for the preceding phase must pass:

| Milestone Gate | Verification Command / Check | Pass Condition |
|---|---|---|
| **Phase 1 Gate** | `npm run build && npm run lint` | Next.js builds clean; theme toggle functions between light/dark without hydration mismatch. |
| **Phase 2 Gate** | Component unit tests / story visual checks | Status badges render correct state icons; Axios token queue handles 401 refresh; SSE viewer buffers logs. |
| **Phase 3 Gate** | Route navigation & middleware test | Unauthenticated access to `/dashboard` redirects to `/login`; sidebar toggles between 256px and 64px. |
| **Phase 4 Gate** | End-to-end user workflows | All 10 domain pages load data, submit forms with Zod validation, and render deployment stream events. |
