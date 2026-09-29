# Design: Fix Project Runtime and Type Variant Serialization

## Context
See [proposal.md](file:///Users/mislamdev/Desktop/projects/personal/rust/forge_frontend/openspec/changes/fix-project-runtime-variants/proposal.md) for background and motivation. The backend Axum server uses Rust `sea-orm` active enums serialized via Serde with PascalCase variant identifiers:
- `ProjectRuntime`: `NodeJs`, `Python`, `Go`, `Static`
- `ProjectTypes`: `Repo`, `Files`

Currently, `src/lib/api/types.ts`, `src/lib/validation/projects.ts`, `NewProjectWizard.tsx`, and `projects/page.tsx` use lowercase representations (`node`, `python`, `rust`, `repo`), causing deserialization failure on project creation (`POST /api/v1/projects`).

## Goals / Non-Goals

**Goals:**
- Define strict TypeScript enum-matching union types for `ProjectRuntime` and `ProjectType` in `src/lib/api/types.ts`.
- Update Zod validation schemas in `src/lib/validation/projects.ts` to strictly validate `NodeJs`, `Python`, `Go`, `Static` for runtime and `Repo`, `Files` for type.
- Decouple user-facing labels ("Node.js", "Python", "Go", "Static Site") in wizard selector cards from backend wire values.
- Align project list runtime filter options and badge rendering in `projects/page.tsx` and `ProjectHeader.tsx`.
- Update mock seeds (`seeds.ts`) and mock adapter (`adapter.ts`) to maintain parity with backend types.

**Non-Goals:**
- Modifying backend Rust enums, database migrations, or SeaORM schema definitions.
- Adding arbitrary custom runtime types (e.g. `docker`, `rust`) until supported by backend entities.

## Decisions

### 1. Direct Alignment of TypeScript Types with Backend Serde Enums
- **Choice**: Define `ProjectRuntime` as `'NodeJs' | 'Python' | 'Go' | 'Static'` and `ProjectType` as `'Repo' | 'Files'` directly in `types.ts`.
- **Alternatives Considered**:
  - *Keep lowercase types in frontend and use an interceptor/transformer before POST*: Rejected because bidirectional mapping increases boilerplate, risk of mismatch in query filters, and debugging confusion.
  - *Loosely typed `string`*: Rejected because it forfeits compile-time safety and runtime validation guarantees.

### 2. UI Label Decoupling via Configuration Maps
- **Choice**: In `NewProjectWizard.tsx`, define runtime options as configuration objects containing `{ value: 'NodeJs', label: 'Node.js', description: '...' }`. The form state and serialized payload will store and send `value` directly.
- **Alternatives Considered**:
  - *Formatting raw enum strings directly in JSX with regex*: Rejected as brittle for non-standard labels like "Node.js" vs "NodeJs" or "Static Site" vs "Static".

### 3. Zod Enum Validation
- **Choice**: Use `z.enum(['NodeJs', 'Python', 'Go', 'Static'])` and `z.enum(['Repo', 'Files'])` in `src/lib/validation/projects.ts`.
- **Alternatives Considered**:
  - *Keep `z.string().min(1)`*: Rejected because invalid or outdated runtime names would bypass frontend validation and fail only at the network boundary.

## Risks / Trade-offs

- **[Existing Mock / Cached Data Mismatch]** → Mitigation: Update `mock/seeds.ts` and `mock/adapter.ts` so mock items use `NodeJs`, `Python`, `Go`, `Static`, preventing runtime filter discrepancies in development and mock modes.
- **[UI Filter Breakage in Project Listing]** → Mitigation: Update runtime filter pills in `src/app/(dashboard)/projects/page.tsx` to match the new `ProjectRuntime` values with clean UI labels.
