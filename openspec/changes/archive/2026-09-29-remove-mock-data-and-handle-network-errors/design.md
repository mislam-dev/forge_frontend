# Design: Remove Mock Data and Handle Network Errors

## Context
See [proposal.md](file:///Users/mislamdev/Desktop/projects/personal/rust/forge_frontend/openspec/changes/remove-mock-data-and-handle-network-errors/proposal.md). Currently, `src/lib/api/client.ts` contains an Axios response interceptor that catches any network error (`!error.response || error.code === 'ERR_NETWORK'`) or mock-enabled flag and silently resolves synthetic data from `src/lib/api/mock/adapter.ts`. Similarly, `useSseStream.ts` falls back to `simulateBuildStream`, `Sidebar.tsx` hardcodes `mockOrgs`, and `login/page.tsx` falls back to `'mock_access_token'`. This obscures real backend failures and leads to confusion during development and testing.

## Goals / Non-Goals

**Goals:**
- Eliminate mock interceptors in `client.ts` and remove mock data generation from `src/lib/api/mock/`.
- Normalize transport and network errors in `client.ts` into structured error envelopes (`code: 'ERR_NETWORK'`, clear descriptive user message).
- Eliminate simulated log emitter fallbacks in `useSseStream.ts` so connection failures are surfaced accurately.
- Provide a reusable `QueryErrorState` UI component displaying an alert icon, error message, and a "Try Again" retry action.
- Update dashboard pages (`dashboard/page.tsx`, `projects/page.tsx`, `projects/[id]/page.tsx`, etc.) to display `QueryErrorState` when queries fail.
- Wire TanStack Query global error listeners in `QueryProvider.tsx` to surface unexpected query/mutation failures via destructive toasts.
- Dynamically fetch organizations in `Sidebar.tsx` via `useOrganizationsList()` instead of static mock arrays.
- Remove synthetic token fallbacks in authentication routes (`login/page.tsx`).

**Non-Goals:**
- Implementing local offline storage / IndexedDB replication.
- Altering backend Axum error response schemas.

## Decisions

### 1. Centralized Network Error Normalization in Axios Interceptor
- **Choice**: In `apiClient.interceptors.response`, check if `!error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')`. When true, reject with a normalized error object:
  ```ts
  {
    is_error: true,
    code: 'ERR_NETWORK',
    message: 'Unable to connect to server. Please check your network connection and verify the backend is running.',
  }
  ```
- **Alternatives Considered**:
  - *Pass raw AxiosError*: Causes inconsistent error handling in UI hooks because `error.response?.data` is undefined for network errors.
  - *Keep mock fallback behind a debug flag*: Rejected because user explicitly requested removing mock data and showing real error messages.

### 2. Dual-Layer Error Feedback: Inline Component + Global Toast
- **Choice**:
  - **Inline**: Primary dashboard pages (`dashboard/page.tsx`, `projects/page.tsx`, etc.) inspect `isError` and render `QueryErrorState` with a "Try Again" button calling `refetch()`.
  - **Global**: `QueryProvider.tsx` configures `QueryCache` and `MutationCache` to trigger `toast({ title: 'Network Error', description: ..., variant: 'destructive' })` for mutation failures or unhandled query errors.
- **Alternatives Considered**:
  - *Toast only*: If a user visits an empty dashboard with a failed query, a transient toast disappears after 5 seconds leaving a blank page with no indication of failure.
  - *Inline error only*: Fails to notify users when background mutations (e.g. create project, save env var) fail.

### 3. Retain SSE Stream Simulation (For Now)
- **Choice**: Preserve `enableSimulationFallback` and `simulateBuildStream` in `useSseStream.ts` and `src/lib/api/mock/stream.ts` so developers can observe simulated log streaming in development while real-time build streaming backend integration is stabilized.

### 4. Dynamic Sidebar Organization Source
- **Choice**: In `Sidebar.tsx`, invoke `useOrganizationsList()`. Render real organization items, falling back gracefully to a prompt or empty list when no organizations exist.

## Risks / Trade-offs

- **[Offline Local Development]** → Mitigation: When the backend is not running, the UI displays clear, explicit error cards informing the developer to start the backend (`cargo run`), eliminating mystery behaviors.
- **[Repeated Query Failure Noise]** → Mitigation: React Query retry is limited to 1 attempt to avoid hammering an offline backend, and global toast notifications deduplicate identical query errors.
