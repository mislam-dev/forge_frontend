# Design

## Context

See `proposal.md` for motivation.

The backend endpoint `POST /api/v1/projects/:id/repository` accepts a JSON payload deserialized by Serde into the following Axum Rust DTO:
```rust
pub struct ConnectProjectRepositoryDTO {
    #[validate(length(min = 5, message = "Repository URL must be valid"))]
    pub repository_url: String,

    pub access_token: Option<String>,
    pub default_branch: Option<String>,
}
```

The frontend codebase currently has legacy types in `src/lib/api/types.ts` (`SaveRepositoryRequest` with `repo_url`, `default_branch`, `auth_token`), in `src/lib/hooks/api/useProjectRepo.ts` (`useUpdateProjectRepository` posting `{ repo_url, default_branch, auth_token }`), and in `src/components/projects/NewProjectWizard.tsx` (posting mixed properties). These mismatches cause backend 422/400 deserialization errors:
`"missing field repository_url at line 1 column 68"`.

## Goals / Non-Goals

**Goals:**
- Add `ConnectProjectRepositoryDTO` to `src/lib/api/types.ts` matching the backend struct.
- Reconcile `SaveRepositoryRequest` to alias or adopt `ConnectProjectRepositoryDTO` fields (`repository_url`, `access_token`, `default_branch`).
- Update `src/lib/hooks/api/useProjectRepo.ts` (`useSaveProjectRepository`, `useUpdateProjectRepository`) to accept and send `ConnectProjectRepositoryDTO`.
- Clean up `src/components/projects/NewProjectWizard.tsx` to send strictly `{ repository_url, default_branch, access_token }`.
- Ensure all repository mock fallbacks in `src/lib/hooks/api/useProjectRepo.ts` and `src/lib/api/mockData.ts` stay consistent.

**Non-Goals:**
- Changing backend Rust code or database schemas.
- Modifying other repository endpoints (`/validate`, `/clone`, `/branches`, `/commits`) unless their request payload signatures are directly affected.

## Decisions

### Decision 1: Explicit `ConnectProjectRepositoryDTO` Type Definition
- **Choice**: Export `ConnectProjectRepositoryDTO` interface in `src/lib/api/types.ts`:
  ```ts
  export interface ConnectProjectRepositoryDTO {
    repository_url: string;
    access_token?: string | null;
    default_branch?: string | null;
  }
  ```
  Set `export type SaveRepositoryRequest = ConnectProjectRepositoryDTO;` for backwards compatibility with any remaining imports.
- **Alternatives Considered**:
  - Keep `SaveRepositoryRequest` with optional `repo_url?: string; repository_url?: string;`.
  - *Rejected* because permissive/optional fields risk silently emitting the wrong field again. Strict typings eliminate regressions.

### Decision 2: Standardizing Hook Parameters
- **Choice**: In `useSaveProjectRepository` and `useUpdateProjectRepository`, accept `ConnectProjectRepositoryDTO` (or parameters with `{ repository_url, default_branch, access_token }`).
- **Alternatives Considered**:
  - Keep accepting `repo_url` in the hook and translate it to `repository_url` internally.
  - *Rejected* because having divergent names between UI forms, hooks, and API contracts creates confusion. We standardize on `repository_url` and `access_token` across the stack.

## Risks / Trade-offs

- **[Risk] Any UI forms or mocks still providing `repo_url` or `auth_token` could fail type checks.**
  → *Mitigation*: Run `pnpm tsc --noEmit` and search the repository for all occurrences of `repo_url` and `auth_token` in repository-related files to verify clean migration.
