# Spec Delta

## MODIFIED Requirements

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
