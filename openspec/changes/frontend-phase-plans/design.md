# Design: Frontend Phase Implementation Plans

## Context

See `proposal.md` for motivation. The Forge frontend documentation in `docs/frontend/` details the UI tokens, reusable components, routing structures, API client patterns, and 10 domain modules. To transition from documentation to phased execution, we are creating a dedicated `docs/plan/` directory containing an overarching roadmap and four focused phase plans.

## Goals / Non-Goals

**Goals:**
- Provide a standardized, modular execution blueprint in `docs/plan/` broken down into four distinct phases matching `docs/frontend/README.md`.
- Include precise file manifests, dependency packages, TypeScript signatures, and verification steps in each phase document.
- Provide clear verification gates (e.g. build checks, test runs, visual smoke checks) at the end of every phase before advancing to the next.

**Non-Goals:**
- Writing production application code, creating `package.json` in the root, or installing node modules during this planning change.
- Modifying or rewriting existing architectural documents in `docs/frontend/`.

## Decisions

### Decision 1: Directory Structure & File Naming
- **Choice**: Place all phase plans in `docs/plan/` with names matching the implementation sequence:
  ```
  docs/plan/
  ├── README.md                          # Master roadmap, dependency graph, and progress matrix
  ├── phase-1-foundations-theme.md       # Scaffolding, Tailwind tokens, CSS vars, next-themes, Zustand
  ├── phase-2-components-transport.md    # UI primitives, form wrapper, status badges, SSE viewer, Axios, DTOs
  ├── phase-3-shell-routing-auth.md      # Route hierarchy, auth middleware guard, (auth) & (dashboard) shells
  └── phase-4-modules-features.md        # 10 domain module pages, queries, forms, and live build console
  ```
- **Rationale**: Isolates planning roadmaps from static system specifications (`docs/frontend/`), making it easy for engineers and automated coding agents to focus on one phase at a time.
- **Alternatives Considered**: Consolidating everything into a single massive markdown file (rejected due to unwieldy file size and poor context window economy during execution).

### Decision 2: Self-Contained Phase Plans with Strict Verification Gates
- **Choice**: Each phase document will detail:
  1. Objectives & prerequisite inputs from prior phases.
  2. Exact file manifest (paths and roles).
  3. Reference to authoritative sections in `docs/frontend/*.md`.
  4. Code skeletons and key implementation contracts.
  5. Step-by-step verification commands.
- **Rationale**: Guarantees that each phase can be tested and verified independently before proceeding to downstream tasks.

### Decision 3: Decoupled API Transport with Mock Fallbacks
- **Choice**: Document mock fallback capability in Phase 2 and Phase 4 so the frontend dashboard can be rendered, tested, and demonstrated even without a live Axum backend running locally.
- **Rationale**: Enables frontend engineers to develop UI features in parallel without blocking on backend services.

## Risks / Trade-offs

- **[Risk] Specification Drift between docs/frontend and docs/plan** → *Mitigation*: Each phase document explicitly links to corresponding sections in `docs/frontend/01-design-system.md` through `06-project-setup-and-tooling.md` as the authoritative source of truth.
- **[Risk] Node 24 and Next.js 14 Dependency Conflicts** → *Mitigation*: Explicitly document `npm install --legacy-peer-deps` in the Phase 1 setup instructions.
