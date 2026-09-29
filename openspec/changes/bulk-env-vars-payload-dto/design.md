# Design

## Context

The backend Axum service exposes `POST /api/v1/projects/:id/env-vars/bulk` which deserializes into `BulkCreateProjectEnvVarDTO`:
```rust
pub struct ProjectEnvVarItemDTO {
    pub key: String,
    pub value: String,
    pub is_secret: Option<bool>,
    pub environment: String,
}

pub struct BulkCreateProjectEnvVarDTO {
    pub vars: Vec<ProjectEnvVarItemDTO>,
}
```
Currently, frontend components and mutation hooks transmit variable arrays directly (`[item, ...]`), causing deserialization failures. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Provide exact TypeScript representations `ProjectEnvVarItemDTO` and `BulkCreateProjectEnvVarDTO` matching Rust serde conventions.
- Package all bulk environment variable payloads under `{ vars: [...] }` across wizard creation and the dedicated environment variables management page.
- Ensure every item includes `key`, `value`, `environment` (non-empty string), and optional `is_secret`.
- Retain backwards-compatible signatures in `useEnvVars` and `useSaveEnvVars` to avoid breaking existing UI call sites.

**Non-Goals:**
- Changing single-variable endpoints (`PUT /env-vars/:id`, `DELETE /env-vars/:id`).
- Altering the environment variable decryption endpoint or client view logic.

## Decisions

### Decision 1: DTO Modeling in `types.ts`
- **Choice**: Export `ProjectEnvVarItemDTO` and `BulkCreateProjectEnvVarDTO` directly in `src/lib/api/types.ts`.
- **Rationale**: Keeps frontend DTO naming consistent with backend Rust structs, making payload serialization self-documenting.

### Decision 2: Flexible input handling in `useBulkCreateEnvVars`
- **Choice**: In `useBulkCreateEnvVars`, accept either `ProjectEnvVarItemDTO[]` or `BulkCreateProjectEnvVarDTO`, normalizing before dispatch:
  ```ts
  const payload = Array.isArray(input) ? { vars: input } : input;
  await apiClient.post(`/api/v1/projects/${projectId}/env-vars/bulk`, payload);
  ```
- **Rationale**: Prevents regressions if callers pass array arguments while guaranteeing the outbound HTTP body is always `{ vars: [...] }`.

### Decision 3: Update `NewProjectWizard.tsx` and `useSaveEnvVars`
- **Choice**: Wrap variable lists in `{ vars: formattedVars }` in `NewProjectWizard.tsx` and `{ vars: payload.variables }` in `useSaveEnvVars`.
- **Rationale**: Aligns both project onboarding and project settings management with the backend requirement.

## Risks / Trade-offs

- **[Risk]** Single-item fallback in wizard during legacy compatibility:
  - **Mitigation**: If `env-vars/bulk` fails, the wizard's fallback loop continues posting individual items to `POST /api/v1/projects/:id/env-vars` where individual item DTOs are accepted.
