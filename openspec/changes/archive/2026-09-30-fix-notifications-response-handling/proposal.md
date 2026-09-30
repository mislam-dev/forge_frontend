# Proposal

## Why

When navigating to `/notifications`, the frontend crashes with the following error caught by the dashboard error boundary:
```
TypeError: notifications.filter is not a function
    at NotificationsPage.useMemo[unreadCount] (page.tsx:40:26)
    at NotificationsPage (page.tsx:39:30)
```

The Axum backend endpoint `GET /api/v1/notifications` returns a paginated envelope:
```json
{
  "data": {
    "data": [],
    "page": 1,
    "per_page": 20,
    "total": 0,
    "total_pages": 0
  },
  "message": "Notifications retrieved successfully."
}
```

The hook `useNotificationsList` in `src/lib/hooks/api/useNotifications.ts` directly returns `res.data || []`. Because `res.data` is an object (`{ data: [], page: 1, ... }`), the hook resolves with an object instead of an array. Consequently, `notifications.filter` in `NotificationsPage` throws a fatal TypeError.

Additionally, the backend emits `NotificationResponse` records containing `user_id`, `type_name`, `reference_id`, and `reference_type`. The frontend `NotificationDTO` currently lacks these fields, and the UI expects `category` and `severity` properties that need graceful fallbacks and mapping from `type_name`.

## What Changes

- **Update `useNotificationsList` Hook**:
  - Safely extract notifications from paginated response envelopes (`res.data.data` or `res.data.items` or `res.data`), returning `[]` as fallback if empty or invalid.
- **Defensive Rendering in `NotificationsPage`**:
  - Guarantee that `notifications` is handled as an array using defensive unwrapping (`safeNotifications = Array.isArray(notifications) ? notifications : Array.isArray(notifications?.data) ? notifications.data : []`).
  - Calculate `unreadCount` and `filteredNotifications` safely without throwing.
  - Map `type_name` to category and severity if explicit properties are not provided on the backend record.
  - Construct item navigation links using `reference_type` and `reference_id` when `link_url` is omitted.
- **Update API Types in `src/lib/api/types.ts`**:
  - Add `PaginatedData<T>` representing `{ data: T[]; page: number; per_page: number; total: number; total_pages: number; }`.
  - Align `NotificationDTO` with Axum's `NotificationResponse` by including `user_id`, `type_name`, `reference_id`, and `reference_type`.

## Capabilities

### New Capabilities
*(None)*

### Modified Capabilities
- `domain-modules`: Update In-App Notifications Feed requirements to support paginated backend response envelopes and Axum `NotificationResponse` schemas without throwing runtime errors.

## Impact

- `src/lib/api/types.ts`: `NotificationDTO` and `PaginatedData<T>` interface definitions.
- `src/lib/hooks/api/useNotifications.ts`: Array extraction in `useNotificationsList`.
- `src/app/(dashboard)/notifications/page.tsx`: Defensive notification filtering, type-name mapping, and error-free rendering.
