# Spec Delta: dashboard-shell

## MODIFIED Requirements

### Requirement: Collapsible Navigation Sidebar
The workspace sidebar navigation SHALL omit the standalone Organizations route from the primary `navItems` list. The organization switcher dropdown SHALL provide a direct trigger to launch the organization creation dialog.

#### Scenario: Navigating via sidebar links
- **WHEN** a user views the sidebar navigation links
- **THEN** only Overview, Projects, Teams, Notifications, and Settings are displayed in the primary navigation list.

#### Scenario: Creating organization from sidebar switcher
- **WHEN** a user opens the organization dropdown in the sidebar and clicks "Create Organization"
- **THEN** the system SHALL launch the organization creation form modal or intercepted route directly.

### Requirement: User Profile Menu and Workspace Organization Access
The user navigation dropdown in the topbar SHALL provide a "Manage Organization" action navigating to the active organization management view (`/organizations/[id]`).

#### Scenario: Navigating to active organization management
- **WHEN** a user opens the profile dropdown in the topbar and clicks "Manage Organization"
- **THEN** the browser navigates to `/organizations/[id]` using the currently active organization ID.

### Requirement: Dashboard Metric Cards Streamlining
The overview dashboard (`/dashboard`) metric grid SHALL display three core operational cards (Active Deployments, Success Rate 24h, and Total Projects), omitting the redundant Organizations/Workspace count card.

#### Scenario: Inspecting dashboard metric overview
- **WHEN** an authenticated user opens `/dashboard`
- **THEN** exactly three metric cards (Deployments, Success Rate, Projects) are displayed in the metrics grid.
