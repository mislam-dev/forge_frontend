# Design

## Context

When opening `/notifications`, the application encounters an uncaught TypeError in `NotificationsPage`:
```
TypeError: notifications.filter is not a function
    at NotificationsPage.useMemo[unreadCount] (page.tsx:40:26)
    at NotificationsPage (page.tsx:39:30)
```

The error occurs because the backend endpoint `GET /api/v1/notifications` returns a paginated structure enclosed inside standard response envelopes:
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

The hook `useNotificationsList` returns `res.data || []`. Since `res.data` is an object `{ data: [], page: 1, per_page: 20, total: 0, total_pages: 0 }`, the consumer `NotificationsPage` receives the pagination object as `notifications`. Invoking `notifications.filter(...)` immediately throws because `filter` is only available on arrays.

Furthermore, Axum defines notification records as:
```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub type_name: String,
    pub title: String,
    pub message: String,
    pub reference_id: Option<Uuid>,
    pub reference_type: Option<String>,
    pub is_read: bool,
    pub created_at: String,
}
```
The frontend `NotificationDTO` lacks `user_id`, `type_name`, `reference_id`, and `reference_type`, while `NotificationsPage` references `category`, `severity`, and `link_url` which may be absent from raw backend notifications.

## Goals / Non-Goals

**Goals:**
- Extract notification array data reliably in `useNotificationsList` regardless of whether the API returns a direct array, `{ data: [...] }`, or `{ items: [...] }`.
- Ensure `NotificationsPage` defensively treats `notifications` as an array so that neither `unreadCount` nor `filteredNotifications` can throw a TypeError.
- Define `PaginatedData<T>` in `src/lib/api/types.ts` to capture backend pagination envelopes.
- Align `NotificationDTO` with Axum's `NotificationResponse`, supporting `type_name`, `user_id`, `reference_id`, and `reference_type`.
- Provide fallback derivations for `severity`, `category`, and item navigation links in `NotificationsPage` from `type_name` and `reference_*` attributes.

**Non-Goals:**
- Changing backend response schemas or database tables in the Rust Axum service.
- Implementing server-side pagination controls in the notification UI (current scope handles pagination safely while keeping client filtering responsive).

## Decisions

### 1. Robust Unwrapping in `useNotificationsList`
- Update `useNotificationsList` in `src/lib/hooks/api/useNotifications.ts`:
  ```typescript
  const res = (await apiClient.get('/api/v1/notifications', { params })) as unknown as ApiResponse<
    NotificationDTO[] | PaginatedData<NotificationDTO> | { items: NotificationDTO[] }
  >;

  if (Array.isArray(res?.data)) {
    return res.data;
  }
  if (res?.data && 'data' in res.data && Array.isArray((res.data as any).data)) {
    return (res.data as any).data;
  }
  if (res?.data && 'items' in res.data && Array.isArray((res.data as any).items)) {
    return (res.data as any).items;
  }
  return [];
  ```
- *Rationale*: Matches the battle-tested pattern used in `useProjects.ts` and `useDeployments.ts`, safeguarding against varied pagination response envelopes.

### 2. Multi-layered Defensiveness in `NotificationsPage`
- In `src/app/(dashboard)/notifications/page.tsx`, initialize:
  ```typescript
  const rawNotifications = useMemo(() => {
    if (Array.isArray(notifications)) return notifications;
    if (notifications && typeof notifications === 'object' && 'data' in notifications && Array.isArray((notifications as any).data)) {
      return (notifications as any).data;
    }
    return [];
  }, [notifications]);
  ```
- Run both `unreadCount` and `filteredNotifications` against `rawNotifications`.
- *Rationale*: Even during hook transitions, cache hydration, or unexpected mock responses, `NotificationsPage` will never crash.

### 3. DTO Schema Alignment in `types.ts`
- Add `PaginatedData<T>`:
  ```typescript
  export interface PaginatedData<T> {
    data: T[];
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  }
  ```
- Update `NotificationDTO`:
  ```typescript
  export interface NotificationDTO {
    id: string;
    user_id?: string;
    type_name?: string;
    type?: string;
    title: string;
    message: string;
    reference_id?: string | null;
    reference_type?: string | null;
    severity?: 'info' | 'warning' | 'error' | 'success';
    category?: 'deployment' | 'security' | 'team' | 'system' | string;
    is_read?: boolean;
    read_at?: string | null;
    link_url?: string;
    created_at: string;
  }
  ```
- *Rationale*: 100% backward-compatible with existing frontend code while fully accommodating Axum's `NotificationResponse`.

### 4. Smart Fallbacks for Severity, Category, and Details Links
- Severity mapping:
  - If `notif.severity` is provided, use it.
  - Otherwise inspect `notif.type_name`:
    - contains `"error"`, `"fail"` $\rightarrow$ `'error'`
    - contains `"warn"` $\rightarrow$ `'warning'`
    - contains `"success"`, `"complete"` $\rightarrow$ `'success'`
    - default $\rightarrow$ `'info'`
- Category mapping:
  - Use `notif.category || notif.reference_type || notif.type_name || notif.type || 'system'`.
- Link resolution:
  - Use `notif.link_url`, or if `reference_type === 'project'` and `reference_id` exists $\rightarrow$ `/projects/${notif.reference_id}`.
  - If `reference_type === 'deployment'` and `reference_id` exists $\rightarrow$ `/deployments/${notif.reference_id}`.

## Risks / Trade-offs

- [Risk] If a future backend change replaces `data.data` with another key.
  $\rightarrow$ *Mitigation*: The multi-branch unwrapper checks `Array.isArray(res.data)`, `res.data.data`, and `res.data.items`, defaulting to `[]`.
