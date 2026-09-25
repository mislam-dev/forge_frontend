import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  NotificationDTO,
} from '@/lib/api/types';

export const notificationsKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationsKeys.all, 'list'] as const,
};

export function useNotificationsList() {
  return useQuery<NotificationDTO[]>({
    queryKey: notificationsKeys.list(),
    queryFn: async () => {
      const res = (await apiClient.get('/api/v1/notifications')) as unknown as ApiResponse<NotificationDTO[]>;
      return res.data || [];
    },
    refetchInterval: 15000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.patch(`/api/v1/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiClient.post('/api/v1/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all });
    },
  });
}
