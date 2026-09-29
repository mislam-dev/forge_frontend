import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  NotificationDTO,
  UnreadCountDTO,
} from '@/lib/api/types';

export const notificationsKeys = {
  all: ['notifications'] as const,
  list: (unreadOnly?: boolean) => [...notificationsKeys.all, 'list', { unreadOnly }] as const,
  unreadCount: () => [...notificationsKeys.all, 'unread-count'] as const,
};

// 1. List user notifications: GET /api/v1/notifications
export function useNotificationsList(unreadOnly = false, page = 1, limit = 20) {
  return useQuery<NotificationDTO[]>({
    queryKey: notificationsKeys.list(unreadOnly),
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      if (unreadOnly) params.unread_only = true;
      const res = (await apiClient.get('/api/v1/notifications', {
        params,
      })) as unknown as ApiResponse<NotificationDTO[]>;
      return res.data || [];
    },
    refetchInterval: 15000,
  });
}

// 2. Get unread notifications count: GET /api/v1/notifications/unread-count
export function useUnreadNotificationsCount() {
  return useQuery<number>({
    queryKey: notificationsKeys.unreadCount(),
    queryFn: async () => {
      const res = (await apiClient.get(
        '/api/v1/notifications/unread-count'
      )) as unknown as ApiResponse<UnreadCountDTO>;
      return res.data?.unread_count ?? 0;
    },
    refetchInterval: 20000,
  });
}

// 3. Mark single notification as read: PATCH /api/v1/notifications/:id/read
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation<NotificationDTO, Error, string>({
    mutationFn: async (id) => {
      const res = (await apiClient.patch(
        `/api/v1/notifications/${id}/read`
      )) as unknown as ApiResponse<NotificationDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

// 4. Mark all as read: PATCH /api/v1/notifications/read-all
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation<{ count: number }, Error, void>({
    mutationFn: async () => {
      const res = (await apiClient.patch(
        '/api/v1/notifications/read-all'
      )) as unknown as ApiResponse<{ count: number }>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

// 5. Delete / Dismiss notification: DELETE /api/v1/notifications/:id
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/api/v1/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}
