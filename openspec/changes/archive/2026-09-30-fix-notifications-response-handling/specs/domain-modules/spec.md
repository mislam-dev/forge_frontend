# Spec Delta

## MODIFIED Requirements

### Requirement: In-App Notifications Feed
The system SHALL provide a notification center at `/notifications` listing user notifications categorized by severity (info, warning, error, success) or backend `type_name` with read/unread filtering, gracefully parsing paginated response envelopes (`{ data: [...], page, per_page, total, total_pages }`), unread count polling via `GET /api/v1/notifications/unread-count`, single read via `PATCH /api/v1/notifications/:id/read`, mark-all-read via `PATCH /api/v1/notifications/read-all`, dismissal via `DELETE /api/v1/notifications/:id`, and live SSE alerts via `GET /api/v1/notifications/stream`.

#### Scenario: Inspecting notifications with paginated backend response
- **WHEN** a user visits `/notifications` and the backend returns a paginated envelope `{ data: { data: [...], page, per_page, total, total_pages }, message }`
- **THEN** the system SHALL extract the notification items array without throwing `TypeError: notifications.filter is not a function`, compute unread counts accurately, and display the notification feed.

#### Scenario: Rendering notifications with Axum NotificationResponse schema
- **WHEN** notifications contain `id`, `user_id`, `type_name`, `title`, `message`, `reference_id`, `reference_type`, `is_read`, and `created_at`
- **THEN** the system SHALL render each notification card, deriving severity and category from `type_name` when explicit severity/category fields are omitted, and resolve detail links from `reference_type` and `reference_id` when `link_url` is absent.

#### Scenario: Marking all notifications as read
- **WHEN** a user clicks "Mark all as read"
- **THEN** the system SHALL invoke `PATCH /api/v1/notifications/read-all`, update all unread notifications to read status, and reset the unread count badge in the Topbar.

#### Scenario: Live notification pushes
- **WHEN** an SSE connection to `/api/v1/notifications/stream` receives an incoming alert event
- **THEN** the system SHALL increment unread counts and display a toast alert in the Topbar.
