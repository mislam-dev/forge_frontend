# Spec Delta: Phase Planning

## Purpose

Provides a systematic, four-phase implementation roadmap and documentation framework in the project documentation directory to guide engineering execution from initial scaffolding to full feature integration.

## ADDED Requirements

### Requirement: Implementation Plan Folder Structure
The documentation structure SHALL provide a dedicated `docs/plan/` directory containing dedicated markdown roadmaps for every implementation phase and an overarching index.

#### Scenario: Developer navigates to plan directory
- **WHEN** a developer inspects the `docs/plan/` directory
- **THEN** `docs/plan/README.md`, `phase-1-foundations-theme.md`, `phase-2-components-transport.md`, `phase-3-shell-routing-auth.md`, and `phase-4-modules-features.md` exist and are accessible

### Requirement: Phase 1 Foundations & Theme Specification
The Phase 1 plan SHALL specify exact dependencies, CSS variable token definitions, Tailwind configuration, dark/light theme integration via `next-themes`, and Zustand client stores according to `docs/frontend/01-design-system.md` and `docs/frontend/06-project-setup-and-tooling.md`.

#### Scenario: Reviewing Phase 1 roadmap
- **WHEN** a contributor reads `docs/plan/phase-1-foundations-theme.md`
- **THEN** they find an actionable file creation manifest, environment variable definitions (`.env.local`), and verification steps for baseline Next.js 14 setup

### Requirement: Phase 2 Components & Data Transport Specification
The Phase 2 plan SHALL specify all reusable shadcn/ui primitives, form engine wrapper, status badges, encrypted value masker, real-time SSE log viewer, Axios client with 401 retry interceptor, and TypeScript DTOs according to `docs/frontend/02-reusable-components.md` and `docs/frontend/04-api-integration.md`.

#### Scenario: Reviewing Phase 2 roadmap
- **WHEN** a contributor reads `docs/plan/phase-2-components-transport.md`
- **THEN** they find step-by-step component contracts, code skeletons, and verification tests for UI primitives and API client transport

### Requirement: Phase 3 Shell, Routing & Auth Specification
The Phase 3 plan SHALL specify App Router route hierarchy, route groups `(auth)` and `(dashboard)`, authentication middleware guard, login/register/reset pages, and dashboard layout with collapsible sidebar and navigation header according to `docs/frontend/03-pages-and-routes.md`.

#### Scenario: Reviewing Phase 3 roadmap
- **WHEN** a contributor reads `docs/plan/phase-3-shell-routing-auth.md`
- **THEN** they find layout composition guidelines, route guard test scenarios, and page scaffolding instructions for auth and shell layouts

### Requirement: Phase 4 Domain Modules & Features Specification
The Phase 4 plan SHALL specify page implementations, query hooks, form integrations, and real-time SSE stream viewers for all 10 domain modules detailed in `docs/frontend/05-module-specs.md`.

#### Scenario: Reviewing Phase 4 roadmap
- **WHEN** a contributor reads `docs/plan/phase-4-modules-features.md`
- **THEN** they find endpoint-to-page mappings, data hook integration guides, and live build stream console specifications for projects and deployments
