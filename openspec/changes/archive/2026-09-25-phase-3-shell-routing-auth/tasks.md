# Tasks

## 1. Edge Authentication Middleware Guard

- [x] 1.1 Implement `src/middleware.ts` with route matchers for protected routes (`/dashboard`, `/organizations`, `/teams`, `/projects`, `/notifications`, `/settings`) and auth routes (`/login`, `/register`, `/forgot-password`, `/reset-password`), inspecting `forge_access_token` cookies with redirect handling. Verify clean TypeScript compilation.

## 2. Public Authentication Route Group (auth)

- [x] 2.1 Implement `src/app/(auth)/layout.tsx` featuring centered card layout, platform branding badge, and footer links. Verify clean TypeScript compilation.
- [x] 2.2 Implement `src/app/(auth)/login/page.tsx` with email/password form, Zod validation, token storage (`localStorage` and cookie), and redirect handling. Verify clean TypeScript compilation.
- [x] 2.3 Implement `src/app/(auth)/register/page.tsx` with user registration form and strong password validation. Verify clean TypeScript compilation.
- [x] 2.4 Implement `src/app/(auth)/forgot-password/page.tsx` and `src/app/(auth)/reset-password/page.tsx` for self-service password recovery. Verify clean TypeScript compilation.

## 3. Dashboard Shell & Layout Components

- [x] 3.1 Implement `src/components/layout/Breadcrumbs.tsx` with dynamic route segment navigation and Chevron separators. Verify clean TypeScript compilation.
- [x] 3.2 Implement `src/components/layout/UserNav.tsx` dropdown menu displaying user profile info, theme options, and sign-out handler. Verify clean TypeScript compilation.
- [x] 3.3 Implement `src/components/layout/Sidebar.tsx` binding to `useWorkspaceStore` with animated collapse (`w-64` to `w-16`), tenant org switcher, and primary nav links. Verify clean TypeScript compilation.
- [x] 3.4 Implement `src/components/layout/Topbar.tsx` sticky header (64px) integrating sidebar toggle, breadcrumbs, notifications bell, and user navigation. Verify clean TypeScript compilation.
- [x] 3.5 Implement `src/app/(dashboard)/layout.tsx` combining Sidebar, Topbar, and responsive `<main>` container. Verify clean TypeScript compilation.

## 4. Dashboard Fallback States & Overview Route

- [x] 4.1 Implement `src/app/(dashboard)/loading.tsx` rendering skeleton cards and table placeholding blocks. Verify clean TypeScript compilation.
- [x] 4.2 Implement `src/app/(dashboard)/error.tsx` client error boundary with error message display and reset retry button. Verify clean TypeScript compilation.
- [x] 4.3 Implement `src/app/(dashboard)/page.tsx` overview starter view connecting to dashboard metrics DTOs. Verify clean TypeScript compilation.

## 5. Verification & Production Build

- [x] 5.1 Execute `pnpm exec tsc --noEmit` and verify zero TypeScript errors across all routes, middleware, and shell components.
- [x] 5.2 Execute `pnpm exec next build --webpack` and verify that the Next.js production build succeeds with exit code 0.
