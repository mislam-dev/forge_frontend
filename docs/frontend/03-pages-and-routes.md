# Pages & App Router Hierarchy Specification

> **Document:** Pages & App Router Hierarchy Specification  
> **Version:** 1.0.0  
> **Target Framework:** Next.js 14+ App Router  
> **Scope:** Directory routes, page layouts, middleware auth guards, and user interaction flows  

---

## 1. App Router Directory Structure

The frontend leverages Next.js 14+ App Router nested layouts (`layout.tsx`) and route groups `(auth)` and `(dashboard)` for clean route separation:

```
app/
├── (auth)/                         # Authentication Route Group (Unprotected)
│   ├── layout.tsx                  # Centered Auth Card Layout (Logo, Dark background)
│   ├── login/page.tsx              # Login Page
│   ├── register/page.tsx           # Registration Page
│   ├── forgot-password/page.tsx    # Password Reset Request Page
│   └── reset-password/page.tsx     # Password Reset Completion Page
│
├── (dashboard)/                    # Main Platform Workspace (Protected by Auth Middleware)
│   ├── layout.tsx                  # Dashboard Layout (Sidebar + Topbar Navigation)
│   ├── page.tsx                    # Overview Dashboard (/dashboard)
│   ├── organizations/
│   │   ├── page.tsx                # Organizations List (/organizations)
│   │   └── [id]/
│   │       ├── page.tsx            # Organization Overview & Settings
│   │       ├── members/page.tsx    # Org Members & Invitations
│   │       └── teams/page.tsx      # Org Teams Management
│   ├── teams/
│   │   └── page.tsx                # Global Teams List (/teams)
│   ├── projects/
│   │   ├── page.tsx                # Projects List (Personal & Org Workspaces)
│   │   ├── new/page.tsx            # Project Creation Wizard
│   │   └── [id]/
│   │       ├── page.tsx            # Project Overview Dashboard
│   │       ├── repository/page.tsx # Git Repository & PAT Settings
│   │       ├── env-vars/page.tsx   # Environment Variables Editor
│   │       ├── access/page.tsx     # Project Team & Member Assignments
│   │       └── deployments/
│   │           ├── page.tsx        # Project Deployments History
│   │           └── [depId]/page.tsx# Real-Time Live Log Stream & Build Console
│   ├── notifications/
│   │   └── page.tsx                # In-App Notifications Feed
│   └── settings/
│       ├── page.tsx                # User Profile & Preferences
│       └── security/page.tsx       # Password Change & Active Sessions
│
├── api/                            # Next.js Route Handlers (SSE Proxy / Token Refresh)
│   └── auth/callback/route.ts
├── layout.tsx                      # Root Layout (Providers: QueryClientProvider, ThemeProvider, Toaster)
├── middleware.ts                   # Auth Middleware Guard (Redirects unauthenticated users to /login)
└── globals.css                     # Design System CSS Variables & Tailwind Imports
```

---

## 2. Authentication Middleware Guard (`middleware.ts`)

Intercepts HTTP requests, inspecting the `jwt_access_token` cookie or header. Unauthenticated requests targeting `(dashboard)` routes are automatically redirected to `/login?redirect=<path>`.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/organizations",
  "/teams",
  "/projects",
  "/notifications",
  "/settings",
];

const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("forge_access_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // 1. Redirect unauthenticated user accessing protected routes to /login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect authenticated user accessing auth routes to /dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 3. Detailed Page Layout Specifications

### 3.1 Primary Dashboard Workspace (`/dashboard`)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Page Header: Dashboard Overview                      [+ New Project]    │
├───────────────┬───────────────┬───────────────┬─────────────────────────┤
│ Active        │ Successful    │ Total         │ Organizations           │
│ Deployments   │ Builds (24h)  │ Projects      │ Count                   │
│  4 Active     │  98.4%        │  12 Active    │  3 Workspace Orgs       │
├───────────────┴───────────────┴───────────────┴─────────────────────────┤
│ Recent Activity & Active Deployments Feed                               │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ project-api-gateway  │ Dep #104 │ Building  │ 1m 45s │ [View Logs]  │ │
│ │ forge-web-client     │ Dep #103 │ Running   │ 4h 12m │ [View Logs]  │ │
│ │ worker-service-go    │ Dep #102 │ Success   │ 1d ago │ [View Logs]  │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Widgets**:
  - `MetricCard`: Shows metric value, subtext trend, icon (`<Server>`, `<Activity>`, `<Briefcase>`, `<Building>`).
  - `ActiveDeploymentsTable`: Live state badges, duration counters, link to build log console.

---

### 3.2 Project Creation Wizard (`/projects/new`)

3-step wizard with client-side Zod validation step gating:

```
Step 1: General Project Info  ──► Step 2: Repository Setup ──► Step 3: Env Vars (Optional)
┌──────────────────────────┐   ┌────────────────────────┐   ┌────────────────────────┐
│ Name: "my-web-api"       │   │ Git URL: https://...   │   │ KEY=VALUE pairs        │
│ Workspace: Personal / Org│   │ Branch: "main"         │   │ Mass import / JSON     │
│ Runtime: Node.js / Rust  │   │ PAT Token: "••••••••"  │   │ POSIX validation check │
└──────────────────────────┘   └────────────────────────┘   └────────────────────────┘
```

---

### 3.3 Project Environment Variables Editor (`/projects/[id]/env-vars`)

Interactive env var editor supporting POSIX key validation, bulk creation, secret value masking, and transactional save:

- **Key Input**: Enforces POSIX key pattern (`^[A-Z_][A-Z0-9_]*$`).
- **Value Input**: Password field masked as `"••••••••"` with copy-to-clipboard button.
- **Scope Selector**: `All Environments` | `Production` | `Staging` | `Development`.
- **Bulk Action**: Textarea for pasting `.env` file contents, automatically parsed into key-value DTOs.

---

### 3.4 Live Build Log Console & Deployment View (`/projects/[id]/deployments/[depId]`)

Real-time SSE build streaming console with state controls:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Deployment #dep_8f91a7  │ Project: "forge-backend"  │ Status: [Building] │
│ Triggered by: user_123   │ Started: 2 mins ago       │ Commit: 4a2b9ef    │
│ Actions: [Redeploy Project] [Rollback to Last Success]                  │
├─────────────────────────────────────────────────────────────────────────┤
│ <SseLogViewer />                                                        │
│ [10:14:02] INFO Cloning git repository https://github.com/org/repo... │
│ [10:14:05] INFO Validating build manifest (Rust / Cargo.toml)...       │
│ [10:14:08] INFO Executing 5-step build execution pipeline...           │
│ [10:14:15] INFO Cargo compilation completed in 7.2s. 0 errors.         │
│ [10:14:18] INFO Health check probe passed on port 8080.                 │
└─────────────────────────────────────────────────────────────────────────┘
```
