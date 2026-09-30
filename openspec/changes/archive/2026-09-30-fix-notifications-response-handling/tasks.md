# Tasks

## 1. Type Definitions & API Hook Alignment

- [x] 1.1 Add `PaginatedData<T>` interface and align `NotificationDTO` with Axum's `NotificationResponse` in `src/lib/api/types.ts` by adding `user_id?: string; type_name?: string; reference_id?: string | null; reference_type?: string | null;`.
- [x] 1.2 Update `useNotificationsList` in `src/lib/hooks/api/useNotifications.ts` to defensively extract notification lists from pagination envelopes (`res.data.data`, `res.data.items`, or direct arrays) and return an empty array on null/empty.

## 2. NotificationsPage Defensiveness & Presentation

- [x] 2.1 Implement defensive array normalization (`safeNotifications`) in `src/app/(dashboard)/notifications/page.tsx` so `unreadCount` and `filteredNotifications` never execute `.filter()` on a non-array object.
- [x] 2.2 Implement fallback helpers in `NotificationsPage` to derive `severity` (`info`, `warning`, `error`, `success`) and `category` from `type_name` when explicit severity or category fields are absent.
- [x] 2.3 Enable navigation link resolution from `reference_type` and `reference_id` when `link_url` is omitted on the backend notification record.

## 3. Verification & Build

- [x] 3.1 Run `pnpm tsc --noEmit` to verify zero TypeScript errors across the modified files.
- [x] 3.2 Run `pnpm build` to verify a successful Next.js production build.
