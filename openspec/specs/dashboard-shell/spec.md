# dashboard-shell Specification

## Purpose
Provides the primary layout shell for authenticated workspace pages, incorporating a collapsible navigation sidebar, dynamic breadcrumbs, user profile controls, skeleton fallbacks, and error boundaries.

## Requirements

### Requirement: Collapsible Navigation Sidebar
The application SHALL provide a workspace sidebar component with smooth width transition between expanded (`w-64`) and collapsed (`w-16`) states, linked directly to persisted state in `useWorkspaceStore`.

#### Scenario: Toggling sidebar collapsed state
- **WHEN** a user clicks the sidebar toggle button
- **THEN** the sidebar width animates between 256px and 64px, labels hide or reveal cleanly, and the preference persists in local storage

#### Scenario: Switching active organization tenant
- **WHEN** a user selects a different organization from the sidebar organization switcher
- **THEN** `useWorkspaceStore` updates `activeOrgId` and `activeOrgName`, updating the active workspace context across the application

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
