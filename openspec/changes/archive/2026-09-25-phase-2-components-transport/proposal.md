# Proposal: Phase 2 - Reusable Components & API Transport Layer

## Why

Following the completion of the baseline theme engine and application foundation in Phase 1, the dashboard requires standard UI building blocks, form abstraction, specialized operational widgets, and a resilient API communication layer before full pages, authentication flows, and real-time deployment modules can be constructed. Without standard primitives and centralized transport interceptors, subsequent features would duplicate Radix wrappers, styling patterns, authentication token handling, and log stream parsing.

## What Changes

- **UI Primitives (`src/components/ui/`)**: Implement accessible shadcn/ui headless Radix UI components (Button, Badge, Input, Textarea, Label, Dialog, DropdownMenu, Table, Tabs, Skeleton, Toast/Toaster).
- **Form Engine (`src/components/shared/form/`)**: Build `FormWrapper` integrating `react-hook-form` and `@hookform/resolvers/zod` with automated loading spinner states.
- **Domain Operational Widgets (`src/components/shared/`)**: Implement `StatusBadge` (supporting 6 deployment lifecycle states with pulse animations), `EncryptedValueMasker` (with reveal toggle and clipboard copy), `SseLogViewer` (terminal console with search, auto-scroll, and export), and generic `DataTable` (powered by `@tanstack/react-table`).
- **API Transport & DTOs (`src/lib/api/`)**: Centralize Axios client instance (`apiClient`) with Bearer auth injection, UUID `x-request-id` headers, and automatic concurrent 401 token refresh queue; establish core API response and domain DTO interfaces (`ApiResponse<T>`, `PaginatedResponse<T>`, `UserDTO`, `AuthTokensDTO`, `ProjectDTO`, `DeploymentDTO`).
- **Real-Time Streaming & Query Infrastructure (`src/lib/hooks/`, `src/components/providers/`)**: Create `useSseStream` hook for live deployment build logs with automatic reconnection and bounded buffer; implement `QueryProvider` configuring TanStack Query client defaults.

## Capabilities

### New Capabilities
- `ui-components`: Accessible shadcn/ui UI primitives, validated form engine wrapper, and domain operational widgets (StatusBadge, EncryptedValueMasker, SseLogViewer, DataTable).
- `api-transport`: Centralized Axios HTTP client with JWT auto-refresh retry loop, unified TypeScript DTOs, real-time SSE log streaming hook, and TanStack Query provider.

### Modified Capabilities
<!-- None: Phase 1 foundations-theme and phase-planning requirements remain unchanged. -->

## Impact

- **Dependencies**: Adds or activates `@radix-ui/*` primitives, `react-hook-form`, `@hookform/resolvers/zod`, `zod`, `axios`, `uuid`, `@tanstack/react-table`, and `@tanstack/react-query`.
- **Project Structure**: Establishes `src/components/ui/`, `src/components/shared/`, `src/lib/api/`, and `src/lib/hooks/`.
- **Compatibility**: All components strictly adhere to dark/light theme variables and tokens established in Phase 1 (`foundations-theme`).
