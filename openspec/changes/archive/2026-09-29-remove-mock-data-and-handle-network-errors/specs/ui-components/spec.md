# Spec Delta: ui-components

## ADDED Requirements

### Requirement: Query and Network Error Feedback Components
The application SHALL provide a reusable `QueryErrorState` widget rendering an error icon, error title, descriptive network/server failure message, and an interactive "Try Again" retry button to handle failed data queries across views.

#### Scenario: Displaying network error state with retry action
- **WHEN** an asynchronous data query fails due to network outage or API error
- **THEN** the component SHALL display a themed card with an alert icon, the failure message, and an active retry button that triggers query refetch upon click
