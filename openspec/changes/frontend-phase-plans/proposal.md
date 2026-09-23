# Proposal

## Why

The `docs/frontend/` directory contains complete architecture and technical specifications across 7 core documents, but lacks an operational, phase-by-phase implementation roadmap. Developers and coding agents need actionable, sequenced plan documents with concrete file checklists, dependency trees, and verification steps in `docs/plan/` to build out the Next.js frontend systematically without missing requirements or incurring technical debt.

## What Changes

- Create `docs/plan/` folder inside the `docs/` directory.
- Create master roadmap index in `docs/plan/README.md`.
- Create comprehensive plan for Phase 1: `docs/plan/phase-1-foundations-theme.md` (Project scaffolding, Next.js 14, TypeScript, Tailwind CSS tokens, HSL variables, next-themes, Zustand stores, and base layout).
- Create comprehensive plan for Phase 2: `docs/plan/phase-2-components-transport.md` (shadcn/ui primitives, FormWrapper, StatusBadge, EncryptedValueMasker, DataTable, SseLogViewer, Axios client with 401 refresh loop, TypeScript DTOs, and SSE hook).
- Create comprehensive plan for Phase 3: `docs/plan/phase-3-shell-routing-auth.md` (Auth middleware guard, `(auth)` layouts & pages, `(dashboard)` shell with collapsible sidebar, topbar, breadcrumbs, and user menu).
- Create comprehensive plan for Phase 4: `docs/plan/phase-4-modules-features.md` (Domain modules: Overview Dashboard, Organizations, Teams, Projects & Env Vars, Deployment history & Real-time build stream console, and User profile settings).

## Capabilities

### New Capabilities
- `phase-planning`: Specification and governance for phased execution blueprints, file manifests, component checklists, and milestone verification procedures for constructing the frontend application.

### Modified Capabilities
<!-- None -->

## Impact

- **Documentation**: Adds structured implementation guides inside `docs/plan/` without altering or overwriting existing architectural docs in `docs/frontend/`.
- **Development Workflow**: Unlocks organized, sequential implementation with measurable checkpoints across all 4 frontend phases.
- **Codebase**: Zero production code changes at this planning stage.
