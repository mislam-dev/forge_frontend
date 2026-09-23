# Frontend Project Setup, Tooling & OpenAPI CodeGen Specification

> **Document:** Project Setup, Tooling & CodeGen Specification  
> **Version:** 1.0.0  
> **Scope:** Project bootstrap, dependency manifest, OpenAPI TypeScript type generation pipeline, Zustand UI store, error boundaries, and environment variables  

---

## 1. Environment Variables Configuration (`.env.local`)

```bash
# Backend Axum REST API URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# Platform App Info
NEXT_PUBLIC_APP_NAME="Forge Platform"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# Optional: Real-Time SSE Stream Override URL
NEXT_PUBLIC_SSE_LOG_URL=http://localhost:8080
```

---

## 2. Package Manifest & Commands (`package.json`)

### Dependencies:
```json
{
  "name": "forge-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "generate:types": "openapi-typescript ../docs/system/05-api/openapi.yaml -o lib/api/types.generated.ts"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.4",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^1.2.2",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tanstack/react-query": "^5.28.9",
    "@tanstack/react-table": "^8.15.0",
    "axios": "^1.6.8",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.359.0",
    "next": "14.1.4",
    "next-themes": "^0.3.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.51.2",
    "tailwind-merge": "^2.2.2",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "^9.0.1",
    "zod": "^3.22.4",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/node": "^20.11.30",
    "@types/react": "^18.2.69",
    "@types/react-dom": "^18.2.22",
    "@types/uuid": "^9.0.8",
    "autoprefixer": "^10.4.19",
    "openapi-typescript": "^6.7.5",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.4.3"
  }
}
```

---

## 3. Automated OpenAPI TypeScript CodeGen Pipeline

To ensure the frontend TypeScript API interfaces never desynchronize from the backend Axum API models, the frontend uses `openapi-typescript` pointing directly to `docs/system/05-api/openapi.yaml`:

```bash
# Run type generation command
npm run generate:types
```

This generates `lib/api/types.generated.ts` containing precise types for all request bodies, path parameters, and `ApiResponse<T>` wrappers.

---

## 4. App Router Error Boundary & Skeleton Loading States

### 4.1 Global Error Boundary (`app/(dashboard)/error.tsx`)

Catches unhandled runtime rendering or network errors within the dashboard layout:

```tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error boundary caught exception:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="p-3 bg-rose-500/10 rounded-full text-rose-500 mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground text-sm max-w-md mb-6">
        {error.message || "An unexpected error occurred while loading this workspace component."}
      </p>
      <Button onClick={() => reset()} variant="outline">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}
```

---

### 4.2 Loading Skeleton Suspense Fallback (`app/(dashboard)/loading.tsx`)

Renders clean skeleton place-holders while Server Components load data:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}
```

---

## 5. Client State Management (Zustand Stores)

### 5.1 Active Workspace & Preferences Store (`lib/store/useWorkspaceStore.ts`)

Manages active organization selection and UI preferences across page switches:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkspaceState {
  activeOrgId: string | null;
  activeOrgName: string | null;
  isSidebarCollapsed: boolean;
  setActiveOrg: (id: string | null, name: string | null) => void;
  toggleSidebar: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeOrgId: null,
      activeOrgName: null,
      isSidebarCollapsed: false,
      setActiveOrg: (id, name) => set({ activeOrgId: id, activeOrgName: name }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    }),
    {
      name: "forge_workspace_preferences",
    }
  )
);
```
