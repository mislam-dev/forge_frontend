# Forge Platform — Frontend Architecture & Master Documentation Index

> **Document Version:** 1.0.0  
> **Target Framework:** Next.js 14+ (App Router) · React 18/19 · TypeScript 5.x  
> **UI Architecture:** shadcn/ui · Tailwind CSS v3/v4 · Lucide React Icons  
> **State & Forms:** TanStack Query v5 · React Hook Form · Zod Validation  
> **Backend Alignment:** Axum API (OpenAPI 3.0.3) · Server-Sent Events (SSE)  
> **Date:** September 2026  
> **Author:** Frontend Architecture Lead & UI/UX Systems Team  

---

## 1. Overview & Master Index

This directory contains the authoritative technical documentation for building the **Forge Platform Web Dashboard**.

The frontend application is a modern, high-performance **Next.js App Router Dashboard** built to consume the backend Forge Axum REST API. It enables developers, team leads, and organization administrators to manage infrastructure, runtimes, environment variables, access permissions, multi-tenant organizations, and real-time deployment build streams.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Next.js App Router (Client / SSR)                    │
│        Layout Hierarchy · Dark/Light Mode · Middleware Auth Guards      │
├─────────────────────────────────────────────────────────────────────────┤
│                     Design System & Component Layer                     │
│  shadcn/ui Primitives · Tailwind CSS Token System · Lucide Icons Catalog│
│    Form Engine (React Hook Form + Zod) · Data Tables · Status Badges    │
├─────────────────────────────────────────────────────────────────────────┤
│                     State & Data Management Layer                       │
│     TanStack Query (Cache/Sync) · SSE Stream Hooks · Auth Store (Zustand)│
├─────────────────────────────────────────────────────────────────────────┤
│                        HTTP / Transport Adapter                         │
│  Axios Client · Interceptors · Auto Token Refresh · OpenAPI Type Sync   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Documentation Structure

| # | Document | Scope & Purpose |
|---|----------|-----------------|
| 01 | [Design System & Theme Specification](./01-design-system.md) | Tailwind theme tokens, CSS variables, typography, color palette, status tokens, and dark mode |
| 02 | [Reusable Components Catalog](./02-reusable-components.md) | Component architecture, shadcn/ui primitives, form wrappers, data tables, modals, and SSE log viewers |
| 03 | [Pages & App Router Hierarchy](./03-pages-and-routes.md) | Next.js App Router folder structure, page designs, layout compositions, and route guards |
| 04 | [API Integration & State Management](./04-api-integration.md) | HTTP client, React Query hooks, SSE streaming client, JWT auto-refresh, and Zod DTO schema validation |
| 05 | [Frontend Module Specifications](./05-module-specs.md) | Detailed specifications for all 10 domain modules (Auth, Orgs, Teams, Projects, Deployments, Logs, etc.) |
| 06 | [Project Setup & CodeGen Tooling](./06-project-setup-and-tooling.md) | Package manifest, OpenAPI TypeScript CodeGen pipeline, Zustand stores, error boundaries & `.env.local` |

---

## 3. Technology Stack Specification

- **Core Framework:** Next.js 14+ (App Router with Server Components & Client Components)
- **Language:** TypeScript 5.x (Strict mode enabled)
- **Styling & Design Tokens:** Tailwind CSS v3/v4 + `clsx` + `tailwind-merge` (`cn` helper)
- **UI Component Library:** shadcn/ui (Radix UI headless primitives)
- **Icons:** Lucide React (`lucide-react`)
- **Forms & Validation:** `react-hook-form` + `@hookform/resolvers` + `zod`
- **Server State & Caching:** `@tanstack/react-query` v5
- **Client State Management:** `zustand` (Auth session & persistent UI preferences)
- **Real-Time Data Transport:** EventSource API / Custom SSE React Hooks
- **HTTP Client:** `axios` with request/response interceptors

---

## 4. Implementation Phase Order

To ensure clean implementation without technical debt, frontend development must strictly follow this 4-step sequence:

```
Phase 1: Design System & Theme Foundations
  ├── Establish Tailwind CSS tokens, CSS variables, and typography scale
  ├── Configure Dark / Light mode theme provider (`next-themes`)
  └── Define status color semantics (Success, Warning, Error, Running, Queued)

Phase 2: Reusable Component Library Setup
  ├── Install and configure shadcn/ui base primitives (`Button`, `Input`, `Dialog`, `Table`, etc.)
  ├── Build Form Abstraction (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`)
  ├── Build reusable `DataTable` with sorting, filtering, and pagination
  └── Build specialized widgets (`StatusBadge`, `EncryptedValueMasker`, `SseLogViewer`)

Phase 3: Pages & Layout Construction
  ├── Implement Root Layout and Global Navbar / Sidebar navigation
  ├── Build Authentication views (`/auth/login`, `/auth/register`, `/auth/forgot-password`)
  ├── Build Organization & Team management pages (`/organizations`, `/teams`)
  ├── Build Project Workspace & Env Var editor pages (`/projects`, `/projects/[id]`)
  └── Build Deployment Stream & History views (`/projects/[id]/deployments/[depId]`)

Phase 4: API Integration & Data Wiring
  ├── Set up Axios HTTP client with Bearer Token interceptors and 401 token refresh loop
  ├── Map backend Axum DTOs to Zod schemas and TypeScript types
  ├── Write TanStack Query custom hooks (`useProjects`, `useDeployments`, `useOrganizations`)
  └── Wire SSE live build log stream hook into deployment viewer
```

---

**Maintainer:** Frontend Architecture Team  
**Last Updated:** September 2026
