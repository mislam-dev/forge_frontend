# Design

## Context

The backend Axum service stores environment variables with SeaORM mapped to a 3-variant enum:
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
The frontend previously contained references to `'all'`, `'preview'`, and PascalCase strings (`'Production'`, `'Preview'`). See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**
- Introduce a centralized `ProjectEnvironment` type: `'development' | 'production' | 'staging'`.
- Update all DTOs and interfaces in `src/lib/api/types.ts` to use `ProjectEnvironment`.
- Update `NewProjectWizard.tsx` and `src/app/(dashboard)/projects/[id]/env-vars/page.tsx` to present only the three valid environments in UI dropdowns.
- Ensure all serialized network requests transmit exact lowercase values (`"development"`, `"production"`, `"staging"`).

**Non-Goals:**
- Changing deployment trigger environments or runtime status filters.
- Modifying backend database schemas or Axum endpoints.

## Decisions

### Decision 1: Centralized `ProjectEnvironment` type
- **Choice**: Export `type ProjectEnvironment = 'development' | 'production' | 'staging'` from `src/lib/api/types.ts`.
- **Rationale**: Provides strict TypeScript checking across API requests, mutation hooks, form states, and table rows.

### Decision 2: Removal of `'all'` and `'preview'`
- **Choice**: Remove `'all'` and `'preview'` from environment variable forms and state. Default newly created rows and bulk `.env` imports to `'production'`.
- **Rationale**: Prevents runtime SeaORM serialization and validation rejections on the backend.

### Decision 3: UI representation
- **Choice**: In dropdown menus, display capitalized labels with lowercase values:
  - `production` -> "Production"
  - `staging` -> "Staging"
  - `development` -> "Development"
- **Rationale**: Preserves clean UI aesthetics while keeping payload values identical to `#[sea_orm(string_value = "...")]`.

## Risks / Trade-offs

- **[Risk]** Existing stored or mock environment variables containing legacy values.
  - **Mitigation**: Add a defensive fallback during mapping so that any unknown string normalizes to `'production'`.
