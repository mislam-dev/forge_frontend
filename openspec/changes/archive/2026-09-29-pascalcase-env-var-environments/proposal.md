# Proposal

## Why

The backend Axum service deserializes JSON environment values via Serde using the default Rust enum variant names: `Development`, `Production`, and `Staging`. Sending lowercase `"production"` fails JSON body deserialization with:
`"Failed to deserialize the JSON body into the target type: vars[0].environment: unknown variant production, expected one of Development, Production, Staging at line 1 column 64"`.
Updating the frontend to serialize environment values as PascalCase (`"Development" | "Production" | "Staging"`) resolves this deserialization failure.

## What Changes

- Update `ProjectEnvironment` in `src/lib/api/types.ts` to `'Development' | 'Production' | 'Staging'`.
- Update `NewProjectWizard.tsx` to default to `'Production'`, use PascalCase dropdown options (`Production`, `Staging`, `Development`), and serialize exact PascalCase variants.
- Update `src/app/(dashboard)/projects/[id]/env-vars/page.tsx` to default to `'Production'`, use PascalCase dropdown values, and normalize incoming server strings to PascalCase.

## Capabilities

### New Capabilities

### Modified Capabilities
- `domain-modules`: Update environment variables management requirements to specify that environment values are serialized in PascalCase (`Development`, `Production`, `Staging`) matching backend Serde enum variants.

## Impact

- `src/lib/api/types.ts`: Updates `ProjectEnvironment` to `'Development' | 'Production' | 'Staging'`.
- `src/components/projects/NewProjectWizard.tsx`: Updates default row state, dropdown values, and mapping to PascalCase.
- `src/app/(dashboard)/projects/[id]/env-vars/page.tsx`: Updates default row state, bulk import parser, and dropdown options to PascalCase.
- Backend API compatibility: Eliminates HTTP 422 JSON deserialization errors on `POST /api/v1/projects/:id/env-vars/bulk`.
