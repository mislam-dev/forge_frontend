import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, API_BASE_URL } from '@/lib/api/client';
import {
  ApiResponse,
  PaginatedResponse,
  DeploymentDTO,
  TriggerDeploymentRequest,
  RollbackProjectRequest,
  DeploymentLogLineDTO,
} from '@/lib/api/types';

export const deploymentsKeys = {
  all: ['deployments'] as const,
  lists: () => [...deploymentsKeys.all, 'list'] as const,
  list: (projectId: string, status?: string) =>
    [...deploymentsKeys.lists(), projectId, { status }] as const,
  details: () => [...deploymentsKeys.all, 'detail'] as const,
  detail: (depId: string) => [...deploymentsKeys.details(), depId] as const,
  logs: (depId: string, stage?: string) => [...deploymentsKeys.detail(depId), 'logs', { stage }] as const,
  logSearch: (depId: string, query: string) => [...deploymentsKeys.detail(depId), 'search', query] as const,
};

// 1. List project deployments: GET /api/v1/projects/:id/deployments
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
      if (res.data && 'items' in res.data && Array.isArray((res.data as any).items)) {
        return (res.data as any).items;
      }
      return [];
    },
    enabled: Boolean(projectId),
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasActive = data?.some((d) =>
        ['Queued', 'queued', 'Building', 'cloning', 'building', 'Deploying', 'running', 'Running'].includes(d.status)
      );
      return hasActive ? 4000 : 20000;
    },
  });
}

// 2. Deployment Detail: GET /api/v1/deployments/:id
// Supports both signature (depId) and backward-compatible (projectId, depId)
export function useDeploymentDetail(arg1: string, arg2?: string) {
  const depId = arg2 || arg1;

  return useQuery<DeploymentDTO>({
    queryKey: deploymentsKeys.detail(depId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/deployments/${depId}`)) as unknown as ApiResponse<DeploymentDTO>;
      return res.data;
    },
    enabled: Boolean(depId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && ['Success', 'healthy', 'Failed', 'failed', 'Cancelled', 'cancelled'].includes(data.status)) {
        return false;
      }
      return 3000;
    },
  });
}

// 3. Trigger Deployment: POST /api/v1/projects/:id/deployments
export function useTriggerDeployment(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation<DeploymentDTO, Error, TriggerDeploymentRequest | void>({
    mutationFn: async (payload) => {
      const targetProjectId = payload?.project_id || projectId;
      if (!targetProjectId) {
        throw new Error('Project ID is required to trigger a deployment.');
      }

      const body: TriggerDeploymentRequest = {};
      if (payload?.branch) body.branch = payload.branch;
      const commit = payload?.commit_hash || payload?.commit_sha;
      if (commit) body.commit_hash = commit;

      const res = (await apiClient.post(
        `/api/v1/projects/${targetProjectId}/deployments`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )) as unknown as ApiResponse<DeploymentDTO>;
      return res.data;
    },
    onSuccess: (_, variables) => {
      const targetProjectId = (variables as TriggerDeploymentRequest | undefined)?.project_id || projectId;
      queryClient.invalidateQueries({ queryKey: deploymentsKeys.all });
      if (targetProjectId) {
        queryClient.invalidateQueries({ queryKey: deploymentsKeys.list(targetProjectId) });
      }
    },
  });
}

// 4. Redeploy: POST /api/v1/deployments/:id/redeploy
export function useRedeploy() {
  const queryClient = useQueryClient();

  return useMutation<DeploymentDTO, Error, string>({
    mutationFn: async (depId: string) => {
      const res = (await apiClient.post(`/api/v1/deployments/${depId}/redeploy`)) as unknown as ApiResponse<DeploymentDTO>;
      return res.data;
    },
    onSuccess: (_, depId) => {
      queryClient.invalidateQueries({ queryKey: deploymentsKeys.all });
      queryClient.invalidateQueries({ queryKey: deploymentsKeys.detail(depId) });
    },
  });
}

// 5. Rollback: POST /api/v1/projects/:id/rollback
export function useRollbackProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<DeploymentDTO, Error, RollbackProjectRequest | void>({
    mutationFn: async (payload) => {
      const res = (await apiClient.post(
        `/api/v1/projects/${projectId}/rollback`,
        payload || { environment: 'production' }
      )) as unknown as ApiResponse<DeploymentDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deploymentsKeys.all });
    },
  });
}

// Backward-compatible alias for cancel
export function useCancelDeployment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<DeploymentDTO, Error, string>({
    mutationFn: async (depId) => {
      const res = (await apiClient.patch(`/api/v1/deployments/${depId}/status`, {
        status: 'cancelled',
        stage: 'cancelled',
      })) as unknown as ApiResponse<DeploymentDTO>;
      return res.data;
    },
    onSuccess: (_, depId) => {
      queryClient.invalidateQueries({ queryKey: deploymentsKeys.all });
      queryClient.invalidateQueries({ queryKey: deploymentsKeys.detail(depId) });
    },
  });
}

// 6. Stored Deployment Logs: GET /api/v1/deployments/:id/logs
export function useDeploymentLogs(depId: string, stage?: string, limit = 1000, offset = 0) {
  return useQuery<DeploymentLogLineDTO[]>({
    queryKey: deploymentsKeys.logs(depId, stage),
    queryFn: async () => {
      const params: Record<string, unknown> = { limit, offset };
      if (stage) params.stage = stage;
      const res = (await apiClient.get(`/api/v1/deployments/${depId}/logs`, {
        params,
      })) as unknown as ApiResponse<DeploymentLogLineDTO[]>;
      return res.data || [];
    },
    enabled: Boolean(depId),
  });
}

// 7. Search Deployment Logs: GET /api/v1/deployments/:id/logs/search?q=...
export function useSearchDeploymentLogs(depId: string, query: string) {
  return useQuery<DeploymentLogLineDTO[]>({
    queryKey: deploymentsKeys.logSearch(depId, query),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/deployments/${depId}/logs/search`, {
        params: { q: query },
      })) as unknown as ApiResponse<DeploymentLogLineDTO[]>;
      return res.data || [];
    },
    enabled: Boolean(depId && query.trim().length > 0),
  });
}

// 8. Download Raw Logs: GET /api/v1/deployments/:id/logs/download
export async function downloadDeploymentLogs(depId: string, filename?: string): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('forge_access_token') : null;
  const url = `${API_BASE_URL}/api/v1/deployments/${depId}/logs/download`;
  
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  
  if (!response.ok) {
    throw new Error(`Failed to download logs: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename || `deployment-${depId}.log`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(downloadUrl);
  document.body.removeChild(a);
}
