# dashboard-shell Specification

## Purpose
Provides the primary layout shell for authenticated workspace pages, incorporating a collapsible navigation sidebar, dynamic breadcrumbs, user profile controls, skeleton fallbacks, and error boundaries.

## Requirements

### Requirement: Collapsible Navigation Sidebar
The application SHALL provide a workspace sidebar component with smooth width transition between expanded (`w-64`) and collapsed (`w-16`) states, linked directly to persisted state in `useWorkspaceStore` and dynamically rendering the user's personal profile alongside accessible organizations retrieved from `useOrganizationsList()` without hardcoded mock entries, defaulting to the personal profile context.

#### Scenario: Toggling sidebar collapsed state
- **WHEN** a user clicks the sidebar toggle button
- **THEN** the sidebar width animates between 256px and 64px, labels hide or reveal cleanly, and the preference persists in local storage

#### Scenario: Switching active organization tenant
- **WHEN** a user selects a different organization from the sidebar organization switcher
- **THEN** `useWorkspaceStore` updates `activeOrgId` with the organization identifier and `activeOrgName` with the organization name, updating the active workspace context across the application

#### Scenario: Sourcing active organizations in sidebar
- **WHEN** the sidebar renders the organization switcher
- **THEN** it SHALL display the user's personal profile option alongside real organizations fetched from the organization list query, allowing switching between personal and organization workspace contexts

#### Scenario: Defaulting to personal user profile
- **WHEN** the sidebar renders and no active organization has been selected by the user
- **THEN** the workspace switcher defaults to the user's personal profile context, and no organization is forcibly auto-selected

#### Scenario: Switching to personal profile workspace
- **WHEN** a user selects their personal profile option from the switcher dropdown
- **THEN** `useWorkspaceStore` sets `activeOrgId` to null and updates `activeOrgName` to the personal workspace name, clearing any organization context

#### Scenario: Handling zero organizations
- **WHEN** the user belongs to no organizations (`orgs` list is empty)
- **THEN** the workspace switcher maintains the active personal profile, displays an informative empty state under the organization section, and provides a link to create an organization

### Requirement: Sticky Topbar with Dynamic Breadcrumbs
The application SHALL provide a sticky topbar header (`h-16`) displaying the sidebar toggle, dynamic breadcrumbs derived from the current route pathname, notifications icon, theme switcher, and user navigation menu.

#### Scenario: Dynamic route segment breadcrumb rendering
- **WHEN** a user navigates to nested routes such as `/projects/demo/deployments`
- **THEN** the topbar renders interactive breadcrumb links for each segment enabling backward navigation

### Requirement: User Profile Menu and Session Sign-Out
The application SHALL provide a user navigation dropdown in the topbar displaying user avatar, email, profile navigation links, and a sign-out action that clears stored tokens, invalidates auth cookies, and redirects to `/login`.

#### Scenario: Signing out of the application
- **WHEN** a user clicks "Sign Out" in the user dropdown menu
- **THEN** all stored auth tokens and cookies are purged, the user session terminates, and the browser redirects to `/login`

### Requirement: Dashboard Loading Fallback Skeleton
The application SHALL provide an App Router `loading.tsx` component within the dashboard route group rendering skeleton placeholders matching the layout grid during asynchronous data transitions.

#### Scenario: Navigating between dashboard routes
- **WHEN** a route transition is in progress and server components or data queries are resolving
- **THEN** structured skeleton cards and table placeholding blocks are rendered to prevent layout shifts

### Requirement: Dashboard Error Boundary with Recovery
The application SHALL provide an App Router `error.tsx` boundary component within the dashboard route group displaying user-friendly error details and a retry trigger.

#### Scenario: Unexpected runtime render error in dashboard child routes
- **WHEN** an unhandled error occurs within a dashboard page
- **THEN** the error boundary captures the exception, displays an error message with icon, and provides a "Try Again" button that resets the boundary
