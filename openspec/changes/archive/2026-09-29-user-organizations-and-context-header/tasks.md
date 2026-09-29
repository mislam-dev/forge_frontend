# Tasks

## 1. Workspace Store & HTTP Request Interceptor

- [x] 1.1 Update `WorkspaceState` and `useWorkspaceStore` in `src/lib/store/useWorkspaceStore.ts` to support nullable `activeOrgId: string | null` and `activeOrgName: string | null`, with methods to set an organization or reset to personal profile context, and verify type validity with `pnpm tsc --noEmit`.
- [x] 1.2 Update the Axios request interceptor in `src/lib/api/client.ts` to inspect `useWorkspaceStore.getState().activeOrgId` and dynamically attach the `Organization-ID` header when an organization is active, while omitting it when the personal profile is active (`activeOrgId === null`).

## 2. Sidebar Workspace Switcher & Context Controls

- [x] 2.1 Update `src/components/layout/Sidebar.tsx` to remove the automatic auto-selection of `orgs[0]`, keeping `activeOrgId === null` as the default personal profile context.
- [x] 2.2 Integrate `useUserProfile()` in `src/components/layout/Sidebar.tsx` to render the user's personal profile (avatar, name, email) as the primary option in the workspace dropdown switcher alongside member organizations fetched from `useOrganizationsList()`.
- [x] 2.3 Handle empty organization state in the sidebar switcher so users with zero organizations see their personal profile active, an informative empty state under organizations ("No organizations found"), and the "Create Organization" action.
- [x] 2.4 Add query invalidation upon switching workspace context (personal profile vs organization) to trigger refetching of tenant-scoped queries (projects, teams) with the updated `Organization-ID` header.

## 3. Verification & Build

- [x] 3.1 Run TypeScript typecheck (`pnpm tsc --noEmit`) to verify strict type safety across `useWorkspaceStore`, `client.ts`, and `Sidebar.tsx`.
- [x] 3.2 Run Next.js production build (`pnpm build`) to verify clean bundle compilation without hydration or syntax errors.
