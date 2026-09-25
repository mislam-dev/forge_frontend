# ui-components Specification

## Purpose
Provides accessible, modular UI primitives, a type-safe form engine wrapper, and domain-specific operational widgets for status indicators, secret masking, log viewing, and tabular data presentation.

## Requirements

### Requirement: Headless Accessible UI Primitives
The application SHALL provide accessible, styled UI primitive components covering Button, Badge, Input, Textarea, Label, Dialog, DropdownMenu, Table, Tabs, Skeleton, and Toast/Toaster built upon accessible Radix UI primitives and styled with semantic Tailwind CSS tokens.

#### Scenario: Interactive Dialog and Form Inputs
- **WHEN** a user triggers a dialog component or enters values into inputs and textareas
- **THEN** focus is trapped within the open modal, keyboard navigation operates according to WAI-ARIA guidelines, and styles respect the active theme

### Requirement: Type-Safe Form Wrapper Engine
The application SHALL provide a reusable form component wrapper integrating React Hook Form with Zod validation schemas that automatically displays validation errors, handles form submission, and shows an accessible loading spinner state while submission is pending.

#### Scenario: Submitting form with validation errors
- **WHEN** a user attempts to submit a form containing invalid field inputs
- **THEN** the form prevents submission, highlights invalid fields with descriptive error messages, and keeps the submit button enabled

#### Scenario: Submitting form during pending request
- **WHEN** a user submits valid form data and the submission asynchronous handler is executing
- **THEN** the submit button is disabled and displays an active spinning loader indicator until the action settles

### Requirement: Deployment Lifecycle Status Badge
The application SHALL provide a `StatusBadge` widget rendering deployment states (`Queued`, `Building`, `Deploying`, `Running`, `Success`, `Failed`) with designated semantic color tokens, state icons, and CSS animations.

#### Scenario: Rendering in-progress deployment states
- **WHEN** `StatusBadge` receives a status of `Building` or `Deploying`
- **THEN** the badge renders with active animation (bouncing hammer or spinning loader) and theme-consistent warning or info colors

#### Scenario: Rendering terminal deployment states
- **WHEN** `StatusBadge` receives `Success` or `Failed`
- **THEN** the badge renders static checkmark or error icons with emerald or rose semantic color schemes

### Requirement: Encrypted Value Masker
The application SHALL provide an `EncryptedValueMasker` component that conceals sensitive credentials by default, provides an eye toggle to reveal plain text, and enables one-click copying to clipboard with temporary visual confirmation.

#### Scenario: Toggling secret visibility
- **WHEN** a user clicks the visibility toggle icon
- **THEN** the masked value switches between bullet placeholders (`••••••••••••••••`) and the unmasked string

#### Scenario: Copying secret to clipboard
- **WHEN** a user clicks the copy button
- **THEN** the underlying plain text value is written to the system clipboard and the copy button displays a confirmed check icon for two seconds

### Requirement: Real-Time Terminal Log Viewer
The application SHALL provide an `SseLogViewer` component rendering monospaced terminal logs with text filtering, automatic scroll-to-bottom pinning, and a log download export function.

#### Scenario: Auto-scrolling on streaming log output
- **WHEN** new log lines arrive while the viewer is scrolled to the bottom
- **THEN** the viewport automatically scrolls to keep the latest log line in view

#### Scenario: Filtering log lines by search keyword
- **WHEN** a user enters a query string into the log search input
- **THEN** the log viewer displays only lines matching the query while preserving total line count metadata

### Requirement: Generic Accessible Data Table
The application SHALL provide a generic `DataTable` component built with `@tanstack/react-table` supporting column sorting, client-side pagination, and row filtering with empty state feedback.

#### Scenario: Sorting and paginating table data
- **WHEN** a user clicks a sortable column header or navigates pagination buttons
- **THEN** the table reorders row data according to the sort direction and renders the correct slice of items for the active page
