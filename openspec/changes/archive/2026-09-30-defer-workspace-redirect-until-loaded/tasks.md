# Tasks

## 1. Workspace Store Hydration

- [x] 1.1 Add `hasHydrated` and `setHasHydrated` to `WorkspaceState` in `src/lib/store/useWorkspaceStore.ts` with `onRehydrateStorage` callback and `partialize` configuration to exclude ephemeral flags from persistence.

## 2. Route Isolation Redirect Guarding

- [x] 2.1 Update `src/app/(dashboard)/teams/[id]/members/page.tsx` to guard the workspace isolation redirect, verifying `hasHydrated && !isLoading` before executing any redirect to `/dashboard` or `/teams`.
- [x] 2.2 Update `src/app/(dashboard)/teams/page.tsx` to guard the personal workspace redirect, checking `hasHydrated` before redirecting to `/dashboard`.
- [x] 2.3 Update `src/app/(dashboard)/projects/[id]/page.tsx` and `src/components/projects/ProjectHeader.tsx` to ensure `hasHydrated && !isLoading` before evaluating project workspace isolation redirects.

## 3. Verification & Build

- [x] 3.1 Run `pnpm tsc --noEmit` to verify type safety across store, components, and pages.
- [x] 3.2 Run `pnpm build` to verify clean production compilation.
