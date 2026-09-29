# Proposal

## Why

The backend Axum service expects bulk project environment variable creation requests (`POST /api/v1/projects/:id/env-vars/bulk`) to receive a JSON object structured as `{ vars: [...] }` matching `BulkCreateProjectEnvVarDTO { vars: Vec<ProjectEnvVarItemDTO> }`, with required `key`, `value`, `environment`, and optional `is_secret`. Currently, the frontend project wizard and `useEnvVars` hooks transmit a flat array directly, resulting in deserialization errors and failed server persistence.

## What Changes

- Define `ProjectEnvVarItemDTO` and `BulkCreateProjectEnvVarDTO` in `src/lib/api/types.ts` aligning directly with the Rust backend schema.
- Update `useBulkCreateEnvVars` and `useSaveEnvVars` in `src/lib/hooks/api/useEnvVars.ts` to submit the payload wrapped in `{ vars: [...] }`.
- Update `NewProjectWizard.tsx` bulk environment variable creation call to submit payload wrapped in `{ vars: [...] }`.
- Ensure each variable item includes valid `key`, `value`, `environment` string, and `is_secret` flag.

## Capabilities

### New Capabilities

### Modified Capabilities
- `domain-modules`: Update bulk environment variable creation specifications so that `POST /api/v1/projects/:id/env-vars/bulk` adheres to the `{ vars: [...] }` envelope required by `BulkCreateProjectEnvVarDTO`.

## Impact

- `src/lib/api/types.ts`: Adds `ProjectEnvVarItemDTO` and `BulkCreateProjectEnvVarDTO`.
- `src/lib/hooks/api/useEnvVars.ts`: Updates payload packaging in `useBulkCreateEnvVars` and `useSaveEnvVars`.
- `src/components/projects/NewProjectWizard.tsx`: Updates payload packaging when creating projects with environment variables.
- Backend interoperability: Resolves HTTP 422 / deserialization errors when posting bulk environment variables to Axum server.
