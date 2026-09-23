# Phase 3 Implementation Plan: Layout Shell, Routing Architecture & Auth Guards

> **Phase:** 3 of 4  
> **Target:** App Router Hierarchy, Authentication Middleware, (auth) Pages & (dashboard) Shell  
> **Source Documents:** [`docs/frontend/03-pages-and-routes.md`](../frontend/03-pages-and-routes.md) & [`docs/frontend/06-project-setup-and-tooling.md`](../frontend/06-project-setup-and-tooling.md)  
> **Status:** Ready for Implementation  

---

## 1. Overview & Objectives

Phase 3 implements the routing skeleton and layout hierarchy of the application. It secures all private platform routes using Next.js Edge Middleware, delivers a clean centered authentication experience for login/registration flows, and constructs the primary application dashboard shell featuring a collapsible sidebar, top navigation bar, dynamic breadcrumbs, and error boundaries.

---

## 2. File Manifest

| Target File | Component / Purpose | Authoritative Reference |
|---|---|---|
| `middleware.ts` | Next.js Edge auth guard redirecting unauthenticated users | `03-pages-and-routes.md § 2` |
| `app/(auth)/layout.tsx` | Centered authentication layout with brand logo and dark aesthetic | `03-pages-and-routes.md § 1` |
| `app/(auth)/login/page.tsx` | Login page with credentials form and redirect handling | `03-pages-and-routes.md § 3.1` |
| `app/(auth)/register/page.tsx` | Account registration page with validation | `03-pages-and-routes.md § 3.1` |
| `app/(auth)/forgot-password/page.tsx` | Password reset request form | `03-pages-and-routes.md § 3.1` |
| `app/(auth)/reset-password/page.tsx` | Password reset token confirmation form | `03-pages-and-routes.md § 3.1` |
| `app/(dashboard)/layout.tsx` | Workspace layout containing Sidebar, Topbar, and content container | `03-pages-and-routes.md § 4` |
| `components/layout/Sidebar.tsx` | Collapsible sidebar (`w-64` expanded, `w-16` collapsed) with org switcher | `01-design-system.md § 6` |
| `components/layout/Topbar.tsx` | Top header (`h-16`) with sidebar toggle, breadcrumbs, and user nav | `01-design-system.md § 6` |
| `components/layout/Breadcrumbs.tsx` | Dynamic route segment path indicators | `03-pages-and-routes.md § 4` |
| `components/layout/UserNav.tsx` | User avatar dropdown menu with profile and logout actions | `03-pages-and-routes.md § 4` |
| `app/(dashboard)/loading.tsx` | App Router skeleton loading fallback | `06-project-setup-and-tooling.md § 4.2` |
| `app/(dashboard)/error.tsx` | App Router error boundary with retry handler | `06-project-setup-and-tooling.md § 4.1` |

---

## 3. Step-by-Step Implementation Guide

### Step 3.1: Authentication Middleware Guard (`middleware.ts`)
Implement the edge middleware at the project root per `docs/frontend/03-pages-and-routes.md § 2`:
- Inspect incoming cookies for `forge_access_token`.
- Protect all paths starting with:
  - `/dashboard`
  - `/organizations`
  - `/teams`
  - `/projects`
  - `/notifications`
  - `/settings`
- If no token is found, redirect to `/login?redirect=<target_path>`.
- If an authenticated user visits `/login` or `/register`, redirect them directly to `/dashboard`.

### Step 3.2: Authentication Route Group `(auth)`
1. **`app/(auth)/layout.tsx`**:
   - Centered card layout with subtle grid background.
   - Platform branding header (`Forge Platform` logo and badge).
   - Footer with privacy and documentation links.
2. **`app/(auth)/login/page.tsx`**:
   - Email and password input fields using `FormWrapper` and Zod validation.
   - Saves access and refresh tokens upon success, writes token cookie for middleware, and redirects to `?redirect` target or `/dashboard`.
3. **`app/(auth)/register/page.tsx`**:
   - Name, email, and strong password validation (`min(8)` chars with uppercase and symbol).
4. **`app/(auth)/forgot-password/page.tsx` & `reset-password/page.tsx`**:
   - Password reset request and confirmation views.

### Step 3.3: Dashboard Shell & Layout Components
1. **`components/layout/Sidebar.tsx`**:
   - Binds to `useWorkspaceStore` (`isSidebarCollapsed`, `toggleSidebar`).
   - Expanded width `w-64` (256px), collapsed width `w-16` (64px) with smooth CSS transition.
   - Organization dropdown switcher allowing tenant switching.
   - Navigation links:
     - Overview (`/dashboard`)
     - Projects (`/projects`)
     - Organizations (`/organizations`)
     - Teams (`/teams`)
     - Notifications (`/notifications`)
     - Settings (`/settings`)
2. **`components/layout/Topbar.tsx`**:
   - Fixed height `h-16` (64px) with sticky positioning.
   - Left side: Sidebar collapse toggle button and `Breadcrumbs`.
   - Right side: Global environment badge, notifications bell icon, theme toggle, and `UserNav`.
3. **`components/layout/UserNav.tsx`**:
   - Displays user avatar and email.
   - Dropdown options: Account Settings, Security, Documentation, and Sign Out (clears session and redirects to `/login`).
4. **`app/(dashboard)/layout.tsx`**:
   - Combines `Sidebar` and `Topbar` surrounding the `<main>` container (`max-w-[1400px] p-8`).

### Step 3.4: Loading Fallback & Error Boundary
1. **`app/(dashboard)/loading.tsx`**:
   - Renders page title skeleton, stat cards skeletons (4-column grid), and data table skeleton per `docs/frontend/06-project-setup-and-tooling.md § 4.2`.
2. **`app/(dashboard)/error.tsx`**:
   - Renders error warning icon, error description, and "Try Again" retry button per `docs/frontend/06-project-setup-and-tooling.md § 4.1`.

---

## 4. Phase 3 Verification & Acceptance Criteria

Execute the following checks to confirm completion:

```bash
# 1. Typecheck the layout and routing structure
npx tsc --noEmit

# 2. Verify Next.js route compilation
npm run build
```

### Exit Checklist
- [ ] Direct unauthenticated navigation to `/dashboard` redirects to `/login?redirect=%2Fdashboard`.
- [ ] Login page authenticates, stores token in cookie and `localStorage`, and forwards to `/dashboard`.
- [ ] Sidebar collapses between 256px and 64px, persisting state in `useWorkspaceStore`.
- [ ] Breadcrumbs correctly reflect nested routes (e.g., `Projects > [id] > Deployments > [depId]`).
- [ ] User menu dropdown enables clean logout.
- [ ] `DashboardLoading` skeleton displays seamlessly during server-side transitions.
