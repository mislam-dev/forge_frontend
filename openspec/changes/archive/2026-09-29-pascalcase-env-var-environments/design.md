# Design

## Context

The backend Axum service uses Serde without renaming attributes on `ProjectEnvironmentVariablesEnvironment`, expecting variant identifiers `Development`, `Production`, and `Staging`. Submitting lowercase strings causes deserialization rejection with HTTP 422: `unknown variant production, expected one of Development, Production, Staging`. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Update `ProjectEnvironment` in `src/lib/api/types.ts` to `'Development' | 'Production' | 'Staging'`.
- Enforce `'Development' | 'Production' | 'Staging'` on all outgoing network payloads.
- Update `NewProjectWizard.tsx` and `/projects/[id]/env-vars/page.tsx` state, defaults, and dropdown values to PascalCase.
- Provide case-insensitive normalization for incoming server data.

**Non-Goals:**
- Modifying backend Rust structs.
- Changing GET query filter behaviors.

## Decisions

### Decision 1: PascalCase `ProjectEnvironment` Type
- **Choice**: Define `type ProjectEnvironment = 'Development' | 'Production' | 'Staging'` in `src/lib/api/types.ts`.
- **Rationale**: Matches Rust Serde variant names directly.

### Decision 2: Inbound Normalization
- **Choice**: Implement case-insensitive parsing in `/projects/[id]/env-vars/page.tsx` to map any incoming case variant to the canonical PascalCase union.
- **Rationale**: Ensures resilience against existing records that may have been stored in lowercase or mixed case.

### Decision 3: Form State & Select Consistency
- **Choice**: Configure `<select>` options directly with PascalCase values (`Production`, `Staging`, `Development`).
- **Rationale**: Keeps form component state and wire serialization 1:1, avoiding transformation mismatches.

## Risks / Trade-offs

- **[Risk]** Legacy inputs or paste buffers with lowercase environments.
  - **Mitigation**: Normalization fallback maps any string to its corresponding PascalCase variant, defaulting to `'Production'`.
