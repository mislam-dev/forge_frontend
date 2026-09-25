import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { ApiResponse, DashboardMetricsDTO, HealthStatusDTO } from '@/lib/api/types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
  health: () => [...dashboardKeys.all, 'health'] as const,
};

export function useDashboardMetrics() {
  return useQuery<DashboardMetricsDTO>({
    queryKey: dashboardKeys.metrics(),
    queryFn: async () => {
      const res = (await apiClient.get('/api/v1/dashboard/metrics')) as unknown as ApiResponse<DashboardMetricsDTO>;
      return res.data;
    },
    refetchInterval: 30000,
  });
}

export function useSystemHealth() {
  return useQuery<HealthStatusDTO>({
    queryKey: dashboardKeys.health(),
    queryFn: async () => {
      const res = (await apiClient.get('/api/v1/health')) as unknown as ApiResponse<HealthStatusDTO>;
      return res.data;
    },
    refetchInterval: 15000,
  });
}
