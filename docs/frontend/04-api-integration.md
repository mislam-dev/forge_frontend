# API Integration & State Management Specification

> **Document:** API Integration & State Management Specification  
> **Version:** 1.0.0  
> **Target Framework:** Axios · TanStack Query v5 · SSE EventSource · Zod DTOs  
> **Backend Alignment:** Axum API (OpenAPI 3.0.3) · JWT Auth · Real-Time Build Streams  

---

## 1. Overview & Transport Architecture

The frontend communicates with the Axum backend using a centralized **Axios HTTP Client** for REST operations and native **EventSource / Web Streams API** for Server-Sent Events (SSE) live build logs.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           UI Layer (React)                              │
│              Custom TanStack Query Hooks (e.g., useProjects)            │
├─────────────────────────────────────────────────────────────────────────┤
│                     API Integration / Client Layer                      │
│   Axios Client (HTTP)                │   Custom SSE Hook (EventSource)  │
│   ├── Auth Bearer Interceptor        │   ├── Live Log Chunks Stream     │
│   ├── Automatic 401 Refresh Loop     │   ├── Connection Retry Loop      │
│   └── ApiResponse<T> Data Unwrapper  │   └── ANSI Clean Terminal Buffer │
├──────────────────────────────────────┴──────────────────────────────────┤
│                         Axum Backend REST API                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Axios HTTP Client & Auth Token Interceptors

`lib/api/client.ts` manages JWT token attachment, request ID generation, and automatic 401 token refresh retry:

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { v4 as uuidv4 } from "uuid";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Authorization Bearer token & Request ID
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("forge_access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.headers) {
    config.headers["x-request-id"] = uuidv4();
  }
  return config;
});

// Response Interceptor: Auto Token Refresh on 401 Unauthorized
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response.data, // Unwraps backend ApiResponse<T>
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("forge_refresh_token");
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.data.access_token;
        const newRefreshToken = data.data.refresh_token;

        localStorage.setItem("forge_access_token", newAccessToken);
        localStorage.setItem("forge_refresh_token", newRefreshToken);

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);
```

---

## 3. Real-Time SSE Live Build Log Streaming Hook

`lib/hooks/useSseStream.ts` manages SSE log subscriptions for `/api/v1/projects/:id/deployments/:depId/logs/stream`:

```typescript
import { useEffect, useState, useRef } from "react";

interface UseSseStreamOptions {
  url: string;
  enabled?: boolean;
}

export function useSseStream({ url, enabled = true }: UseSseStreamOptions) {
  const [logLines, setLogLines] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled || !url) return;

    const token = localStorage.getItem("forge_access_token");
    const sseUrl = `${url}?token=${encodeURIComponent(token || "")}`;

    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const line = parsed.message || parsed.line || event.data;
        setLogLines((prev) => [...prev, line]);
      } catch {
        setLogLines((prev) => [...prev, event.data]);
      }
    };

    eventSource.onerror = (err) => {
      setIsConnected(false);
      setError(new Error("SSE connection error"));
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [url, enabled]);

  const clearLogs = () => setLogLines([]);

  return { logLines, isConnected, error, clearLogs };
}
```

---

## 4. TanStack Query Hook Catalog

The frontend exposes strongly-typed React Query custom hooks for data fetching, caching, and mutations:

| Custom Hook | HTTP Method | Target API Endpoint | Description | Cache Key |
|---|---|---|---|---|
| `useAuth()` | POST | `/api/v1/auth/login` | Log in user, store tokens, update auth state | N/A |
| `useOrganizations()` | GET | `/api/v1/organizations` | List user's organizations | `["organizations"]` |
| `useOrganization(id)` | GET | `/api/v1/organizations/:id` | Get organization details & members | `["organization", id]` |
| `useTeams(orgId)` | GET | `/api/v1/teams?org_id=:orgId` | List teams in organization | `["teams", orgId]` |
| `useProjects(workspace)` | GET | `/api/v1/projects` | List personal or org projects | `["projects", workspace]` |
| `useProject(id)` | GET | `/api/v1/projects/:id` | Get project details, repo & env vars | `["project", id]` |
| `useCreateProject()` | POST | `/api/v1/projects` | Create project with runtime config | Invalidates `["projects"]` |
| `useDeployments(prjId)` | GET | `/api/v1/projects/:id/deployments` | List deployment history for project | `["deployments", prjId]` |
| `useTriggerDeployment()` | POST | `/api/v1/projects/:id/deployments` | Trigger new deployment execution | Invalidates `["deployments"]` |
| `useRedeploy()` | POST | `/api/v1/projects/:id/deployments/:depId/redeploy` | Trigger redeployment of commit | Invalidates `["deployments"]` |
| `useRollback()` | POST | `/api/v1/projects/:id/deployments/:depId/rollback` | Rollback to last successful build | Invalidates `["deployments"]` |
| `useNotifications()` | GET | `/api/v1/notifications` | Fetch user in-app notifications | `["notifications"]` |
| `useDashboard()` | GET | `/api/v1/dashboard` | Aggregate platform & project metrics | `["dashboard"]` |
| `useHealth()` | GET | `/health` | Fetch readiness probe status | `["health"]` |

---

## 5. Zod Schema Mapping to Axum OpenAPI DTOs

Frontend forms validate payloads using Zod schemas matching the Axum backend OpenAPI schemas exactly:

```typescript
import { z } from "zod";

// Create Project DTO Schema
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(50, "Project name cannot exceed 50 characters")
    .regex(/^[a-z0-9-]+$/, "Name must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().max(255).optional(),
  organization_id: z.string().uuid("Invalid organization ID").nullable().optional(),
  project_type: z.enum(["repo", "files"]),
  runtime: z.enum(["nodejs", "rust", "python", "go", "static_site"]),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

// POSIX Environment Variable DTO Schema
export const envVarSchema = z.object({
  key: z
    .string()
    .min(1, "Key is required")
    .regex(/^[A-Z_][A-Z0-9_]*$/, "Key must be valid POSIX format (e.g. DATABASE_URL)"),
  value: z.string().min(1, "Value is required"),
  environment: z.enum(["all", "production", "staging", "development"]).default("all"),
});

export type EnvVarInput = z.infer<typeof envVarSchema>;
```
