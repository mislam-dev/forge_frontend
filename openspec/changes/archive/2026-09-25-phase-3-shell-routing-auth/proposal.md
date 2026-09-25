# Proposal: Phase 3 - Layout Shell, Routing Architecture & Auth Guards

## Why

Following the completion of the baseline theme system (Phase 1) and reusable UI primitives/transport infrastructure (Phase 2), the application requires a secure routing skeleton, authentication user flows, and an accessible layout shell. Without edge authentication middleware, users could access private management endpoints directly, and without a centralized workspace shell (collapsible sidebar, breadcrumbs, topbar, user profile navigation), upcoming feature modules (projects, deployments, organizations) would lack a consistent host environment.

## What Changes

- **Edge Authentication Guard (`src/middleware.ts`)**: Implement Next.js Edge Middleware to inspect `forge_access_token` cookies; automatically redirect unauthenticated traffic from protected routes (`/dashboard`, `/organizations`, `/teams`, `/projects`, `/notifications`, `/settings`) to `/login?redirect=<path>`, and redirect already-authenticated users from auth routes to `/dashboard`.
- **Public Authentication Route Group (`src/app/(auth)/`)**:
  - `layout.tsx`: Centered card aesthetic with dark theme styling, platform brand badge, and legal/docs footer links.
  - `login/page.tsx`: Credentials login form integrating `FormWrapper` and Zod validation; stores tokens in `localStorage` and browser cookies upon success and redirects to `/dashboard` or query parameter target.
  - `register/page.tsx`: Account registration form with strong password validation rules.
  - `forgot-password/page.tsx` & `reset-password/page.tsx`: Self-service password recovery request and token confirmation screens.
- **Dashboard Workspace Shell (`src/app/(dashboard)/`, `src/components/layout/`)**:
  - `Sidebar.tsx`: Collapsible navigation sidebar (`w-64` expanded, `w-16` collapsed) animated with CSS transitions, bound to `useWorkspaceStore`, featuring an organization tenant switcher and core section links.
  - `Topbar.tsx`: Sticky 64px header containing sidebar toggle button, dynamic breadcrumbs, notifications button, theme switcher, and user navigation profile menu.
  - `Breadcrumbs.tsx`: Reactive path segment parser rendering interactive chevron-separated route links.
  - `UserNav.tsx`: Radix dropdown menu displaying user avatar, email, profile navigation, and logout handler.
  - `layout.tsx`: Root dashboard shell container wrapping children with `Sidebar` and `Topbar`.
  - `loading.tsx`: Instant skeleton fallback rendering layout placeholders during route transitions.
  - `error.tsx`: Client error boundary catching unexpected runtime exceptions with retry action.
  - `page.tsx`: Overview starter page for the `/dashboard` route.

## Capabilities

### New Capabilities
- `auth-routing`: Edge middleware authentication guard, cookie-based token validation, and public auth route group (`/login`, `/register`, `/forgot-password`, `/reset-password`) with centered layout.
- `dashboard-shell`: Primary dashboard workspace shell featuring collapsible sidebar with workspace store state, top navigation bar, dynamic breadcrumbs, user dropdown menu, loading skeletons, and error boundaries.

### Modified Capabilities
<!-- None: Phase 1 foundations-theme, phase-planning, api-transport, and ui-components requirements remain intact. -->

## Impact

- **Routing & Middleware**: Establishes route groups `(auth)` and `(dashboard)` and activates root Next.js middleware.
- **Client State**: Connects layout components to `useWorkspaceStore` (`isSidebarCollapsed`, `toggleSidebar`, `activeOrgId`, `activeOrgName`).
- **Dependencies**: Leverages existing primitives (`Button`, `Input`, `FormWrapper`, `DropdownMenu`, `Skeleton`, `lucide-react`).
