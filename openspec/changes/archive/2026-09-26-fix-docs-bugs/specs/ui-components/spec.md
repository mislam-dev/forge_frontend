# Spec Delta: ui-components

## ADDED Requirements

### Requirement: Accessible Confirmation Dialog Primitive
The application SHALL provide a reusable `<ConfirmDialog>` component built with Radix UI dialog primitives and styled with theme-aware tokens to confirm destructive and high-impact actions (such as deleting projects, revoking team access, and removing organization or team members), replacing browser-native `window.confirm` and `window.alert`.

#### Scenario: Triggering destructive confirmation dialog
- **WHEN** a user initiates a destructive action (e.g., delete project, revoke access, or remove member)
- **THEN** an accessible modal dialog opens displaying a title, explanatory description, a "Cancel" button, and a destructive "Confirm" button with loading state support, trapping keyboard focus within the dialog.

#### Scenario: Dismissing or cancelling confirmation
- **WHEN** a user clicks "Cancel" or hits Escape
- **THEN** the dialog closes without executing the pending mutation and restores focus to the triggering element.

#### Scenario: Confirming the action
- **WHEN** a user clicks the destructive confirmation action button
- **THEN** the dialog displays an in-progress loading spinner, executes the associated mutation, and automatically closes upon completion.
