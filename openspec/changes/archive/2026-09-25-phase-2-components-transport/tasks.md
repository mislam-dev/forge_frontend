# Tasks

## 1. Dependencies & Package Installation

- [x] 1.1 Install required Phase 2 runtime dependencies (`axios`, `uuid`, `@tanstack/react-query`, `@tanstack/react-table`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tabs`, `@radix-ui/react-label`, `@radix-ui/react-toast`, `@radix-ui/react-slot`, `class-variance-authority`). Verify `pnpm install` completes with exit code 0.
- [x] 1.2 Verify `@types/uuid` and dev typing dependencies are present and verify type checking via `pnpm exec tsc --noEmit`.

## 2. API Transport Layer & Data Transfer Objects

- [x] 2.1 Implement `src/lib/api/types.ts` defining `ApiResponse<T>`, `PaginatedResponse<T>`, `UserDTO`, `AuthTokensDTO`, `ProjectDTO`, `DeploymentDTO`, and `OrganizationDTO`. Verify clean TypeScript compilation.
- [x] 2.2 Implement `src/lib/api/client.ts` with Axios instance, Bearer token injection, UUID `x-request-id` header, and concurrent 401 token refresh queue with redirect fallback. Verify clean TypeScript compilation.
- [x] 2.3 Implement `src/lib/hooks/useSseStream.ts` managing `EventSource` connection, log buffer capping (5,000 lines), and exponential reconnect backoff. Verify clean TypeScript compilation.
- [x] 2.4 Implement `src/components/providers/QueryProvider.tsx` wrapping TanStack `QueryClientProvider` with default caching policies. Verify clean TypeScript compilation.

## 3. Accessible UI Primitives

- [x] 3.1 Implement base input and action primitives in `src/components/ui/`: `button.tsx`, `badge.tsx`, `input.tsx`, `textarea.tsx`, and `label.tsx`. Verify clean TypeScript compilation.
- [x] 3.2 Implement overlay and container primitives in `src/components/ui/`: `dialog.tsx`, `dropdown-menu.tsx`, `tabs.tsx`, and `table.tsx`. Verify clean TypeScript compilation.
- [x] 3.3 Implement feedback primitives in `src/components/ui/`: `skeleton.tsx`, `toast.tsx`, `toaster.tsx`, and `use-toast.ts`. Verify clean TypeScript compilation.

## 4. Reusable Domain Widgets & Form Engine

- [x] 4.1 Implement `src/components/shared/form/FormWrapper.tsx` integrating React Hook Form and Zod resolver with loading spinner state. Verify clean TypeScript compilation.
- [x] 4.2 Implement `src/components/shared/StatusBadge.tsx` supporting 6 deployment lifecycle states with designated icons and animations. Verify clean TypeScript compilation.
- [x] 4.3 Implement `src/components/shared/EncryptedValueMasker.tsx` with text masking toggle and copy-to-clipboard confirmation. Verify clean TypeScript compilation.
- [x] 4.4 Implement `src/components/shared/SseLogViewer.tsx` featuring terminal styling, search filtering, auto-scroll toggle, and download capability. Verify clean TypeScript compilation.
- [x] 4.5 Implement `src/components/shared/DataTable.tsx` leveraging `@tanstack/react-table` for sortable, paginated, and filterable tables. Verify clean TypeScript compilation.

## 5. Verification & Build

- [x] 5.1 Execute `pnpm exec tsc --noEmit` and verify zero TypeScript errors across all components, hooks, and transport modules.
- [x] 5.2 Execute `pnpm exec next build --webpack` and verify that the Next.js production build succeeds with exit code 0.
