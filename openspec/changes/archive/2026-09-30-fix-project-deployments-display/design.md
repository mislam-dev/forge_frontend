# Design

## Context

See `proposal.md` for motivation.

The backend Axum service sends standardized envelope responses. For paginated endpoints such as `GET /api/v1/projects/:id/deployments`, the payload structure is:
```json
{
  "message": "Deployments retrieved successfully.",
  "data": {
    "data": [
      {
        "id": "e3c11ba6-8463-4e63-99b2-774ed4104bf4",
        "project_id": "aa3f157f-317f-4103-81fe-76152a0cb6d9",
        "branch": "main",
        "commit_hash": "HEAD",
        "status": "Failed",
        "error_message": "Not Found: Project not found",
        "build_duration": null,
        "deploy_duration": null,
        "created_at": "2026-09-30T12:47:57.700277+00:00",
        "updated_at": "2026-09-30T12:51:23.807197+00:00",
        "triggered_by": "77371d01-2e92-4e51-99ae-f4dd337d6085"
      }
    ],
    "page": 1,
    "per_page": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

Currently, `useDeploymentsList` only inspects `Array.isArray(res.data)` and `res.data.items`, missing `res.data.data` (`PaginatedData<DeploymentDTO>`), and the views expect fields that may not be populated (`deployment_number`, `commit_sha`) without fallback to `id` slice or `commit_hash`.

## Goals / Non-Goals

**Goals:**
- Correctly parse and unwrap `res.data.data` from `ApiResponse<PaginatedData<DeploymentDTO>>` in `useDeploymentsList`.
- Provide resilient rendering in `/projects/[id]/deployments`, `/projects/[id]`, and `/projects/[id]/deployments/[depId]` for:
  - Deployment sequence identifier: `#${dep.deployment_number}` falling back to `#${dep.id.slice(0, 8)}`.
  - Commit identifier: `dep.commit_hash || dep.commit_sha || 'HEAD'`.
  - Error diagnostics: Show `dep.error_message` when status is `Failed`.
  - Duration: Handle `duration_seconds` or sum of `build_duration` + `deploy_duration`.
- Ensure TypeScript types in `useDeployments.ts` correctly describe the possible response shapes (`DeploymentDTO[] | PaginatedData<DeploymentDTO> | PaginatedResponse<DeploymentDTO>`).

**Non-Goals:**
- Implementing full paginated cursor/page navigation controls (defer to future ticket if needed).
- Changing backend Axum REST schemas.

## Decisions

### 1. Robust Envelope Unwrapping in `useDeploymentsList`
- **Choice**: Check for `Array.isArray(res?.data)`, then `res?.data?.data` (as array), then `res?.data?.items` (as array), defaulting to `[]`.
- **Alternatives Considered**:
  - *Assume only `PaginatedData`*: Would break any legacy or mocked endpoints that return raw arrays or `{ items: [...] }`.
  - *Standardize via Axios interceptor*: Too broad; different endpoints use different envelopes and changing the global interceptor could introduce regressions across unverified modules.

### 2. Identifier and Commit Hash Fallback Strategy
- **Choice**:
  - Identifier: `dep.deployment_number ? #${dep.deployment_number} : #${dep.id.slice(0, 8)}`
  - Commit: `dep.commit_hash || dep.commit_sha || 'HEAD'`
- **Rationale**: The backend database may not generate sequential auto-incremented deployment numbers for all projects, and Git revisions can be represented via `commit_hash` instead of `commit_sha`.

### 3. Displaying Failure Diagnostics
- **Choice**: In the deployment history table, if `dep.status === 'Failed'` and `dep.error_message` is present, render a subtle warning/alert indicator or tooltip with the message. Similarly in the detail page and project overview card, surface `error_message`.
- **Rationale**: Immediate visibility into failure causes (e.g. "Not Found: Project not found" or build container crashes) without requiring users to dive into raw logs.

## Risks / Trade-offs

- **[Risk] Multiple envelope formats**: Inconsistent response formats across development mocks and production Axum API.
  → *Mitigation*: The hook parser checks `Array.isArray(res?.data)`, `'data' in res.data`, and `'items' in res.data`, ensuring compatibility with all variations.
- **[Risk] Extremely long error messages overflowing table layout**:
  → *Mitigation*: Truncate error messages with CSS `truncate` and provide title/tooltip for full text.
