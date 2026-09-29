# Spec Delta: dashboard-shell

## MODIFIED Requirements

### Requirement: Collapsible Navigation Sidebar
The application SHALL provide a workspace sidebar component with smooth width transition between expanded (`w-64`) and collapsed (`w-16`) states, linked directly to persisted state in `useWorkspaceStore` and dynamically rendering accessible organizations retrieved from `useOrganizationsList()` without hardcoded mock entries.

#### Scenario: Toggling sidebar collapsed state
- **WHEN** a user clicks the sidebar toggle button
- **THEN** the sidebar width animates between 256px and 64px, labels hide or reveal cleanly, and the preference persists in local storage

#### Scenario: Switching active organization tenant
- **WHEN** a user selects a different organization from the sidebar organization switcher
- **THEN** `useWorkspaceStore` updates `activeOrgId` and `activeOrgName`, updating the active workspace context across the application

#### Scenario: Sourcing active organizations in sidebar
- **WHEN** the sidebar renders the organization switcher
- **THEN** it SHALL display the real organizations fetched from the organization list query and allow switching the active organization context
