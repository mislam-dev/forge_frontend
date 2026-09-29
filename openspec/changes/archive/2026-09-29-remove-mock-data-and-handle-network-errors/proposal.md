# Proposal: Remove Mock Data and Handle Network Errors

## Why
The frontend currently intercepts API and network failures by falling back to synthetic in-memory mock data in `apiClient`, simulated build logs in `useSseStream`, hardcoded organizations in `Sidebar.tsx`, and a dummy access token in the login route. When the backend server is unreachable or offline, the client silently returns fake mock data, hiding real network failures from users and developers and giving a false illusion of system health. Removing all mock fallbacks and replacing them with robust network error normalization, user-friendly error banners, retry triggers, and global toast feedback ensures accurate system state transparency and clear failure diagnostics.

## What Changes
- **Remove Mock Interceptors from Axios Client**: Eliminate `resolveMockRequest` and all `isMockEnabled || isNetworkError` interceptors in `src/lib/api/client.ts`. Discontinue synthetic fallbacks.
- **Normalize Network Errors in API Client**: In `apiClient.interceptors.response`, intercept `ERR_NETWORK`, connection refused, and timeout failures, normalizing them into user-friendly error envelopes: `{ is_error: true, code: 'ERR_NETWORK', message: 'Unable to connect to server. Please verify your connection or backend availability.' }`.
- **Retain SSE Stream Simulation (For Now)**: As specified by user, retain `simulateBuildStream` and `enableSimulationFallback` in `src/lib/hooks/useSseStream.ts` and `src/lib/api/mock/stream.ts` for offline build log viewing.
- **Remove API Mock Adapter and Seeds**: Clean up `src/lib/api/mock/adapter.ts` and `src/lib/api/mock/seeds.ts` so REST APIs never fall back to mock data.
- **Remove Hardcoded Organizations in Sidebar**: Update `src/components/layout/Sidebar.tsx` to bind directly to `useOrganizationsList()` query instead of hardcoded `mockOrgs`.
- **Remove Mock Token Fallback in Login**: Update `src/app/(auth)/login/page.tsx` so missing tokens from the backend trigger a login failure message rather than falling back to `'mock_access_token'`.
- **Introduce Reusable Network Error State Component**: Create `src/components/shared/QueryErrorState.tsx` (and `NetworkErrorAlert.tsx`) rendering an alert icon, clear descriptive message, and an interactive "Try Again" retry button.
- **Render Error States Across Key Views**: Wire `isError` and `error` states in `dashboard/page.tsx`, `projects/page.tsx`, and other key dashboard pages to render `QueryErrorState` when network or API queries fail.
- **Global Mutation & Query Error Toasts in QueryProvider**: Configure default TanStack Query client error listeners in `src/components/providers/QueryProvider.tsx` so unhandled query or mutation errors trigger an informative error toast.

## Capabilities

### Modified Capabilities
- `api-transport`: Update `Centralized Axios Client and Request Headers` requirement to prohibit mock data fallbacks and enforce strict network error envelope normalization.
- `ui-components`: Add requirement for `Query and Network Error Feedback Components` specifying `QueryErrorState` with retry actions and descriptive error messaging.
- `dashboard-shell`: Update `Collapsible Navigation Sidebar` requirement to source active organizations reactively from the backend API instead of static mock arrays.

## Impact
- **Affected Code**: `src/lib/api/client.ts`, `src/components/layout/Sidebar.tsx`, `src/app/(auth)/login/page.tsx`, `src/components/providers/QueryProvider.tsx`, `src/components/shared/QueryErrorState.tsx`, `src/app/(dashboard)/dashboard/page.tsx`, `src/app/(dashboard)/projects/page.tsx`, `src/lib/api/mock/adapter.ts`, `src/lib/api/mock/seeds.ts`.
- **APIs**: Disables mock adapter interceptors; all requests directly query the backend `/api/v1` routes.
- **Dependencies**: No external dependencies added; uses existing `@tanstack/react-query`, `lucide-react`, and `@/components/ui`.
