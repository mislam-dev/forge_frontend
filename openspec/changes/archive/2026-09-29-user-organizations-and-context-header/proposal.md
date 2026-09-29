# Proposal

## Why

Forge users can operate in either a personal workspace context or within one or more organizations they belong to. Previously, the sidebar workspace switcher automatically defaulted to the first organization in the list, did not provide a way to switch back to the user's personal profile, and did not send the tenant-scoping `Organization-ID` header on outgoing API requests. Furthermore, users who belong to no organizations need a seamless, non-broken experience where their personal profile is active by default.

## What Changes

- **Personal Profile Context by Default**: The application defaults active workspace context to the user's personal profile (`activeOrgId: null`), avoiding forced auto-selection of the first organization.
- **Unified Switcher in Left Sidebar**: The sidebar switcher displays the active workspace context (personal profile or selected organization), listing both the user's personal profile and all member organizations for one-click switching.
- **Zero-Organization Support**: When a user belongs to no organizations, the switcher maintains the personal profile context and displays a clean empty state in the organization section alongside the "Create Organization" action.
- **Conditional `Organization-ID` Request Header**: The centralized Axios HTTP client intercepts outgoing API calls and injects the `Organization-ID: <org-id>` header whenever an organization context is selected, omitting the header when operating under the personal profile.
- **Workspace Store Modernization**: The `useWorkspaceStore` state allows clearing or setting the active organization ID (`activeOrgId: string | null`) and name, keeping the selected context synchronized across the client.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `api-transport`: Modify `Requirement: Centralized Axios Client and Request Headers` to conditionally inject the `Organization-ID` header on outgoing requests when an organization is selected, and omit it when operating under the personal profile context.
- `dashboard-shell`: Modify `Requirement: Collapsible Navigation Sidebar` to feature personal profile switching, default to personal profile, display fetched organizations, and support users with zero organizations.

## Impact

- `src/lib/store/useWorkspaceStore.ts`: Support nullable `activeOrgId` and `activeOrgName` in store actions.
- `src/lib/api/client.ts`: Add `Organization-ID` header injection in request interceptor based on active workspace state.
- `src/components/layout/Sidebar.tsx`: Render user profile option, organization list, empty states, and handle switching without auto-forcing `orgs[0]`.
- TanStack Query caches and API requests: All downstream requests will be correctly scoped to the active organization tenant when selected.
