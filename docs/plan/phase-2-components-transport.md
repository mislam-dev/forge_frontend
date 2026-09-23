# Phase 2 Implementation Plan: Reusable Components & API Transport Layer

> **Phase:** 2 of 4  
> **Target:** shadcn/ui Primitives, Form Engine, Domain Widgets, Axios HTTP Client & SSE Hooks  
> **Source Documents:** [`docs/frontend/02-reusable-components.md`](../frontend/02-reusable-components.md) & [`docs/frontend/04-api-integration.md`](../frontend/04-api-integration.md)  
> **Status:** Ready for Implementation  

---

## 1. Overview & Objectives

Phase 2 builds the core UI building blocks and transport infrastructure that all application pages depend upon. By completing this phase, engineers will have a full library of accessible UI primitives, a validated form wrapper, specialized status/terminal widgets, an Axios client with automated 401 token refresh queueing, and a real-time SSE stream hook.

---

## 2. File Manifest

| Target File | Component / Module | Authoritative Reference |
|---|---|---|
| `components/ui/*.tsx` | shadcn/ui Primitives (`Button`, `Input`, `Dialog`, `Table`, `Badge`, `DropdownMenu`, `Tabs`, `Skeleton`, `Toast`) | `02-reusable-components.md § 1` |
| `components/shared/form/FormWrapper.tsx` | Form engine wrapper integrating React Hook Form and Zod | `02-reusable-components.md § 2.1` |
| `components/shared/StatusBadge.tsx` | Status pill mapping 6 deployment lifecycle states to icons and pulses | `02-reusable-components.md § 3.1` |
| `components/shared/EncryptedValueMasker.tsx` | Secret credential masker with eye toggle and clipboard copy | `02-reusable-components.md § 3.2` |
| `components/shared/SseLogViewer.tsx` | High-performance terminal log viewer with auto-scroll and search | `02-reusable-components.md § 3.3` |
| `components/shared/DataTable.tsx` | Generic data table wrapper utilizing `@tanstack/react-table` | `02-reusable-components.md § 4` |
| `lib/api/types.ts` | Complete TypeScript interfaces for `ApiResponse<T>`, DTOs, and schemas | `05-module-specs.md § 1-2` |
| `lib/api/client.ts` | Axios instance with Bearer auth, UUID request ID, and 401 retry queue | `04-api-integration.md § 2` |
| `lib/hooks/useSseStream.ts` | Custom hook for SSE live build logs with auto-reconnect and buffer | `04-api-integration.md § 3` |
| `components/providers/QueryProvider.tsx` | TanStack Query client provider wrapper with caching defaults | `04-api-integration.md § 4` |

---

## 3. Step-by-Step Implementation Guide

### Step 2.1: shadcn/ui Base Primitives (`components/ui/`)
Implement Radix UI headless wrappers with Tailwind styles:
1. `components/ui/button.tsx` (Variants: default, destructive, outline, secondary, ghost, link).
2. `components/ui/badge.tsx` (Outline, default, secondary, destructive variants).
3. `components/ui/input.tsx` and `components/ui/textarea.tsx`.
4. `components/ui/label.tsx`.
5. `components/ui/dialog.tsx` (Modal dialog, overlay, header, footer, title, description).
6. `components/ui/dropdown-menu.tsx`.
7. `components/ui/table.tsx` (Table, TableHeader, TableBody, TableRow, TableHead, TableCell).
8. `components/ui/tabs.tsx`.
9. `components/ui/skeleton.tsx`.
10. `components/ui/toast.tsx` and `components/ui/toaster.tsx`.

### Step 2.2: Form Engine Wrapper (`components/shared/form/FormWrapper.tsx`)
Create the reusable form wrapper adhering to `docs/frontend/02-reusable-components.md § 2.1`:
- Accepts `form: UseFormReturn<TFieldValues>`, `onSubmit: SubmitHandler<TFieldValues>`, `submitLabel`, and `isSubmitting`.
- Automatically renders a submit button with `Loader2` spinner state.

### Step 2.3: Specialized Business Widgets
1. **`StatusBadge.tsx`**:
   - Supports 6 statuses: `"Queued"`, `"Building"`, `"Deploying"`, `"Running"`, `"Success"`, `"Failed"`.
   - Renders designated icons (`Clock`, `Hammer`, `Loader2`, `PlayCircle`, `CheckCircle2`, `XCircle`) and CSS status tokens (`bg-amber-500/10 text-amber-500`, etc.).
2. **`EncryptedValueMasker.tsx`**:
   - Masks secret text by default with `"••••••••••••••••"`.
   - Offers visibility toggle and 2-second copy-to-clipboard confirmation feedback.
3. **`SseLogViewer.tsx`**:
   - Renders a terminal console (`bg-black/90 font-mono text-xs`).
   - Line filtering input, download log file button, and auto-scroll pin to bottom.
4. **`DataTable.tsx`**:
   - Wraps `@tanstack/react-table` for sortable, paginated, and filterable tabular data.

### Step 2.4: API DTOs & Type Definitions (`lib/api/types.ts`)
Synthesize the complete TypeScript models from `docs/frontend/05-module-specs.md`:
```typescript
export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total_items: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// User & Auth DTOs
export interface UserDTO {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface AuthTokensDTO {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserDTO;
}

// Organization, Project & Deployment DTOs...
```

### Step 2.5: Axios Client with Auto-Refresh Interceptor (`lib/api/client.ts`)
Implement Axios client per `docs/frontend/04-api-integration.md § 2`:
- Base URL configured from `process.env.NEXT_PUBLIC_API_URL`.
- Request interceptor attaching `Authorization: Bearer <token>` and `x-request-id: uuidv4()`.
- Response interceptor handling HTTP 401 by queueing concurrent requests, posting to `/api/v1/auth/refresh`, updating `localStorage`, and retrying queued calls.

### Step 2.6: Real-Time SSE Stream Hook (`lib/hooks/useSseStream.ts`)
Create the custom SSE hook per `docs/frontend/04-api-integration.md § 3`:
- Manages an `EventSource` connection to `/api/v1/projects/:id/deployments/:depId/logs/stream`.
- Maintains lines array in React state with maximum buffer capping (e.g. 5,000 lines).
- Implements exponential backoff retry on disconnect.

### Step 2.7: TanStack Query Provider (`components/providers/QueryProvider.tsx`)
Create the query client provider with default stale-time (30s) and retry policies.

---

## 4. Phase 2 Verification & Acceptance Criteria

Execute the following checks to confirm completion:

```bash
# 1. Typecheck the component library and DTO definitions
npx tsc --noEmit

# 2. Verify component imports and build cleanly
npm run build
```

### Exit Checklist
- [ ] All 10 UI primitive components render without JSX errors.
- [ ] `FormWrapper` successfully handles validation errors and submission states.
- [ ] `StatusBadge` displays correct icons and colors across all 6 deployment statuses.
- [ ] `EncryptedValueMasker` toggles plain text and copies to clipboard.
- [ ] `apiClient` attaches `x-request-id` header and catches 401 responses.
- [ ] `useSseStream` hook initializes and manages connection buffers.
