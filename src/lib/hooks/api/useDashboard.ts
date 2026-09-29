import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  DashboardMetricsDTO,
  HealthStatusDTO,
  UserDashboardDTO,
  OrgDashboardDTO,
  HealthLiveDTO,
  HealthReadyDTO,
  HealthDeepDTO,
} from '@/lib/api/types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  system: () => [...dashboardKeys.all, 'system'] as const,
  user: () => [...dashboardKeys.all, 'user'] as const,
  org: (orgId: string) => [...dashboardKeys.all, 'org', orgId] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
  healthLive: () => [...dashboardKeys.all, 'health-live'] as const,
  healthReady: () => [...dashboardKeys.all, 'health-ready'] as const,
  healthDeep: () => [...dashboardKeys.all, 'health-deep'] as const,
  health: () => [...dashboardKeys.all, 'health'] as const,
};

// 1. System-wide Dashboard Metrics (Admin): GET /api/v1/dashboard
export function useSystemDashboard() {
  return useQuery<DashboardMetricsDTO>({
    queryKey: dashboardKeys.system(),
    queryFn: async () => {
      const res = (await apiClient.get('/api/v1/dashboard')) as unknown as ApiResponse<DashboardMetricsDTO>;
      return res.data;
    },
    refetchInterval: 30000,
  });
}

// 2. Personalized User Dashboard: GET /api/v1/dashboard/user
export function useUserDashboard() {
  return useQuery<UserDashboardDTO>({
    queryKey: dashboardKeys.user(),
    queryFn: async () => {
      const res = (await apiClient.get('/api/v1/dashboard/user')) as unknown as ApiResponse<UserDashboardDTO>;
      return res.data;
    },
    refetchInterval: 30000,
  });
}

// 3. Organization Dashboard: GET /api/v1/dashboard/org/:org_id
export function useOrgDashboard(orgId: string) {
  return useQuery<OrgDashboardDTO>({
    queryKey: dashboardKeys.org(orgId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/dashboard/org/${orgId}`)) as unknown as ApiResponse<OrgDashboardDTO>;
      return res.data;
    },
    enabled: Boolean(orgId),
    refetchInterval: 30000,
  });
}

// 4. Kubernetes Liveness Probe: GET /api/v1/health/live
export function useHealthLive() {
  return useQuery<HealthLiveDTO>({
    queryKey: dashboardKeys.healthLive(),
    queryFn: async () => {
      const res = (await apiClient.get('/api/v1/health/live')) as unknown as ApiResponse<HealthLiveDTO>;
      return res.data;
    },
    refetchInterval: 15000,
  });
}

// 5. Readiness Probe (PostgreSQL & RabbitMQ): GET /api/v1/health/ready
export function useHealthReady() {
  return useQuery<HealthReadyDTO>({
    queryKey: dashboardKeys.healthReady(),
    queryFn: async () => {
      const res = (await apiClient.get('/api/v1/health/ready')) as unknown as ApiResponse<HealthReadyDTO>;
      return res.data;
    },
    refetchInterval: 15000,
  });
}

// 6. Deep Diagnostic Probe: GET /api/v1/health/deep
export function useHealthDeep() {
  return useQuery<HealthDeepDTO>({
    queryKey: dashboardKeys.healthDeep(),
    queryFn: async () => {
      const res = (await apiClient.get('/api/v1/health/deep')) as unknown as ApiResponse<HealthDeepDTO>;
      return res.data;
    },
    refetchInterval: 30000,
  });
}

// Backward-compatible hooks for existing overview dashboard view
export function useDashboardMetrics() {
  return useQuery<DashboardMetricsDTO>({
    queryKey: dashboardKeys.metrics(),
    queryFn: async () => {
      // Queries /api/v1/dashboard matching OpenAPI
      const res = (await apiClient.get('/api/v1/dashboard')) as unknown as ApiResponse<DashboardMetricsDTO>;
      return res.data;
    },
    refetchInterval: 30000,
  });
}

export function useSystemHealth() {
  return useQuery<HealthStatusDTO>({
    queryKey: dashboardKeys.health(),
    queryFn: async () => {
      const res = (await apiClient.get('/api/v1/health/ready')) as unknown as ApiResponse<HealthStatusDTO>;
      return res.data;
    },
    refetchInterval: 15000,
  });
}
