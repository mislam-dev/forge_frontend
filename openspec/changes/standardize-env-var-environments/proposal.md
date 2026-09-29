# Proposal

## Why

The backend Axum service and database model define project environment variable environments via a strict three-variant enum:
```rust
pub enum ProjectEnvironmentVariablesEnvironment {
    #[sea_orm(string_value = "development")]
    Development,
    #[sea_orm(string_value = "production")]
    Production,
    #[sea_orm(string_value = "staging")]
    Staging,
}
```
Currently, parts of the frontend reference unsupported values like `'all'` and `'preview'`, or serialize PascalCase strings (`'Production'`, `'Preview'`), resulting in SeaORM database validation failures and rejected requests. Aligning the entire frontend to use strictly `"development" | "production" | "staging"` ensures seamless persistence and consistent environment scoping.

## What Changes

- Define `export type ProjectEnvironment = 'development' | 'production' | 'staging'` in `src/lib/api/types.ts`.
- Update `EnvironmentVariableDTO`, `CreateEnvVarRequest`, `ProjectEnvVarItemDTO`, and `SaveEnvVarItem` to type `environment` as `ProjectEnvironment`.
- Update `NewProjectWizard.tsx` to default newly added environment variables to `'production'`, restrict dropdown selection to `Production`, `Staging`, and `Development`, and serialize exact lowercase values (`"development"`, `"production"`, `"staging"`).
- Update `/projects/[id]/env-vars/page.tsx` to eliminate `'all'` and `'preview'` from row values and default imports, limiting options to `Production`, `Staging`, and `Development`.

## Capabilities

### New Capabilities

### Modified Capabilities
- `domain-modules`: Update environment variables management requirements so that environment scopes are strictly restricted to `development`, `production`, and `staging`.

## Impact

- `src/lib/api/types.ts`: Adds `ProjectEnvironment` type and updates DTO definitions.
- `src/components/projects/NewProjectWizard.tsx`: Restricts environment choices and normalizes serialized payloads.
- `src/app/(dashboard)/projects/[id]/env-vars/page.tsx`: Replaces legacy `'all'` and `'preview'` options with valid environment scopes.
- Backend interoperability: Eliminates database validation errors when storing environment variables.
