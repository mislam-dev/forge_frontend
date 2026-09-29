# Proposal

## Why

When connecting or updating a project's repository source (both during project creation in `NewProjectWizard` and when managing repository settings in `useProjectRepo`), the backend Axum endpoint `POST /api/v1/projects/:id/repository` expects a JSON body deserializable into `ConnectProjectRepositoryDTO`:
```rust
pub struct ConnectProjectRepositoryDTO {
    pub repository_url: String,
    pub access_token: Option<String>,
    pub default_branch: Option<String>,
}
```
Currently, the frontend sends legacy property names (`repo_url`, `auth_token`, `branch`, `auth_type`), which causes Serde deserialization to fail with `"missing field repository_url at line 1 column 68"`. Aligning the frontend API types and hooks to strictly match `ConnectProjectRepositoryDTO` resolves this deserialization failure and establishes type safety across repository connection operations.

## What Changes

- **Define `ConnectProjectRepositoryDTO` in `src/lib/api/types.ts`**:
  - Export `ConnectProjectRepositoryDTO` with fields `repository_url: string`, `access_token?: string | null`, and `default_branch?: string | null`.
  - Update `SaveRepositoryRequest` or alias it to `ConnectProjectRepositoryDTO` to ensure compatibility and deprecate mismatched field names (`repo_url`, `auth_token`).
- **Update repository hooks in `src/lib/hooks/api/useProjectRepo.ts`**:
  - Update `useSaveProjectRepository` and `useUpdateProjectRepository` to accept and serialize `{ repository_url, default_branch, access_token }`.
  - Ensure mock fallbacks conform to the new structure.
- **Update `NewProjectWizard.tsx` repository submission**:
  - Clean up the repository connection payload when creating a new project so that it only sends `repository_url`, `default_branch`, and `access_token` matching `ConnectProjectRepositoryDTO`.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `domain-modules`: Update repository connection and settings configuration to send request payloads strictly conforming to `ConnectProjectRepositoryDTO` (`repository_url`, `access_token`, `default_branch`).

## Impact

- **API Payloads**: `POST /api/v1/projects/:id/repository` payload structure strictly adheres to backend Serde schema with `repository_url`, `access_token`, and `default_branch`.
- **Frontend Code**:
  - `src/lib/api/types.ts`
  - `src/lib/hooks/api/useProjectRepo.ts`
  - `src/components/projects/NewProjectWizard.tsx`
  - Any test or mock references using `repo_url` or `auth_token` for repository connection.
