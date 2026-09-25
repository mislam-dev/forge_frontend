import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  PaginatedResponse,
  DeploymentDTO,
  TriggerDeploymentRequest,
} from '@/lib/api/types';

export const deploymentsKeys = {
  all: ['deployments'] as const,
  lists: () => [...deploymentsKeys.all, 'list'] as const,
  list: (projectId: string, status?: string) =>
    [...deploymentsKeys.lists(), projectId, { status }] as const,
  details: () => [...deploymentsKeys.all, 'detail'] as const,
  detail: (projectId: string, depId: string) =>
    [...deploymentsKeys.details(), projectId, depId] as const,
};

export function useDeploymentsList(projectId: string, status?: string) {
  return useQuery<DeploymentDTO[]>({
    queryKey: deploymentsKeys.list(projectId, status),
    queryFn: async () => {
      const params = status && status !== 'all' ? { status } : undefined;
      const res = (await apiClient.get(`/api/v1/projects/${projectId}/deployments`, {
        params,
      })) as unknown as ApiResponse<DeploymentDTO[] | PaginatedResponse<DeploymentDTO>>;
      
      if (Array.isArray(res.data)) {
        return res.data;
      }
      if (res.data && 'items' in res.data) {
        return res.data.items;
      }
      return [];
    },
    enabled: Boolean(projectId),
    refetchInterval: (query) => {
      // Poll faster if any deployment is Building or Deploying or Queued
      const data = query.state.data;
      const hasActive = data?.some((d) => ['Queued', 'Building', 'Deploying'].includes(d.status));
      return hasActive ? 4000 : 20000;
    },
  });
}

export function useDeploymentDetail(projectId: string, depId: string) {
  return useQuery<DeploymentDTO>({
    queryKey: deploymentsKeys.detail(projectId, depId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/projects/${projectId}/deployments/${depId}`)) as unknown as ApiResponse<DeploymentDTO>;
      return res.data;
    },
    enabled: Boolean(projectId && depId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && ['Success', 'Failed', 'Cancelled'].includes(data.status)) {
        return false;
      }
      return 3000;
    },
  });
}

export function useTriggerDeployment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<DeploymentDTO, Error, TriggerDeploymentRequest | void>({
    mutationFn: async (payload) => {
      const res = (await apiClient.post(
        `/api/v1/projects/${projectId}/deployments`,
        payload || {}
      )) as unknown as ApiResponse<DeploymentDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deploymentsKeys.all });
    },
  });
}

export function useCancelDeployment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<DeploymentDTO, Error, string>({
    mutationFn: async (depId) => {
      const res = (await apiClient.post(
        `/api/v1/projects/${projectId}/deployments/${depId}/cancel`
      )) as unknown as ApiResponse<DeploymentDTO>;
      return res.data;
    },
    onSuccess: (_, depId) => {
      queryClient.invalidateQueries({ queryKey: deploymentsKeys.all });
      queryClient.invalidateQueries({ queryKey: deploymentsKeys.detail(projectId, depId) });
    },
  });
}
