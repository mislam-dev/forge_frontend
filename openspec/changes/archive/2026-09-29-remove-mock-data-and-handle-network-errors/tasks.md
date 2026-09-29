# Tasks

## 1. Transport Layer & Error Normalization

- [x] 1.1 Remove mock interceptor and fallback logic in `src/lib/api/client.ts`, and normalize network failures (`ERR_NETWORK`, connection refused, offline) to reject with structured error envelopes containing descriptive error messages. Verify by inspecting rejection behavior.
- [x] 1.2 Remove synthetic `'mock_access_token'` fallback from `src/app/(auth)/login/page.tsx` so missing tokens from the backend trigger explicit login failure messages. Verify login error propagation.

## 2. UI Error Feedback Components

- [x] 2.1 Implement reusable `QueryErrorState` in `src/components/shared/QueryErrorState.tsx` rendering an alert icon, descriptive error message, and interactive "Try Again" retry button. Verify component exports and styling.
- [x] 2.2 Configure TanStack Query global error listeners in `src/components/providers/QueryProvider.tsx` using `QueryCache` and `MutationCache` to display destructive toast notifications on unhandled network or API errors. Verify toast triggering configuration.

## 3. Dashboard & View Integration

- [x] 3.1 Update `src/app/(dashboard)/dashboard/page.tsx` to handle query error states from `useDashboardMetrics` and `useSystemHealth`, rendering `QueryErrorState` when network requests fail. Verify page error rendering.
- [x] 3.2 Update `src/app/(dashboard)/projects/page.tsx` to handle query error states from `useProjectsList`, rendering `QueryErrorState` when projects fail to load. Verify project list error rendering.
- [x] 3.3 Update `src/components/layout/Sidebar.tsx` to replace hardcoded `mockOrgs` with dynamic `useOrganizationsList()` query data. Verify sidebar organization rendering.

## 4. Mock Cleanup & Configuration

- [x] 4.1 Remove obsolete mock files in `src/lib/api/mock/` (`adapter.ts`, `seeds.ts`) while keeping `stream.ts` for SSE simulation, and clean up any remaining mock flags. Verify no broken imports.

## 5. Verification & Build

- [x] 5.1 Run `pnpm exec tsc --noEmit` and verify zero TypeScript compilation errors across all modules.
- [x] 5.2 Run `pnpm build` and verify Next.js production build succeeds with zero errors.
