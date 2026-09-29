import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  EnvironmentVariableDTO,
  CreateEnvVarRequest,
  BulkEnvVarItem,
  SaveEnvVarsRequest,
} from '@/lib/api/types';

export const envVarsKeys = {
  all: ['env-vars'] as const,
  list: (projectId: string, environment?: string) =>
    [...envVarsKeys.all, projectId, { environment }] as const,
};

// 1. List variables: GET /api/v1/projects/:id/env-vars
export function useProjectEnvVars(projectId: string, environment?: string) {
  return useQuery<EnvironmentVariableDTO[]>({
    queryKey: envVarsKeys.list(projectId, environment),
    queryFn: async () => {
      const params = environment && environment !== 'all' ? { environment } : undefined;
      const res = (await apiClient.get(`/api/v1/projects/${projectId}/env-vars`, {
        params,
      })) as unknown as ApiResponse<EnvironmentVariableDTO[]>;
      return res.data || [];
    },
    enabled: Boolean(projectId),
  });
}

// 2. Create single variable: POST /api/v1/projects/:id/env-vars
export function useCreateEnvVar(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<EnvironmentVariableDTO, Error, CreateEnvVarRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.post(
        `/api/v1/projects/${projectId}/env-vars`,
        payload
      )) as unknown as ApiResponse<EnvironmentVariableDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: envVarsKeys.all });
    },
  });
}

// 3. Bulk create/upsert variables: POST /api/v1/projects/:id/env-vars/bulk
export function useBulkCreateEnvVars(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ count: number }, Error, BulkEnvVarItem[]>({
    mutationFn: async (items) => {
      const res = (await apiClient.post(
        `/api/v1/projects/${projectId}/env-vars/bulk`,
        items
      )) as unknown as ApiResponse<{ count: number }>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: envVarsKeys.all });
    },
  });
}

// 4. Update single variable: PUT /api/v1/projects/:id/env-vars/:env_id
export function useUpdateEnvVar(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    EnvironmentVariableDTO,
    Error,
    { envId: string; payload: Partial<CreateEnvVarRequest> }
  >({
    mutationFn: async ({ envId, payload }) => {
      const res = (await apiClient.put(
        `/api/v1/projects/${projectId}/env-vars/${envId}`,
        payload
      )) as unknown as ApiResponse<EnvironmentVariableDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: envVarsKeys.all });
    },
  });
}

// 5. Delete single variable: DELETE /api/v1/projects/:id/env-vars/:env_id
export function useDeleteEnvVar(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (envId: string) => {
      await apiClient.delete(`/api/v1/projects/${projectId}/env-vars/${envId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: envVarsKeys.all });
    },
  });
}

// 6. Decrypt secrets: GET /api/v1/projects/:id/env-vars/decrypt
export function useDecryptEnvVars(projectId: string, environment = 'production') {
  return useQuery<Record<string, string>>({
    queryKey: [...envVarsKeys.all, 'decrypt', projectId, environment],
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/projects/${projectId}/env-vars/decrypt`, {
        params: { environment },
      })) as unknown as ApiResponse<Record<string, string>>;
      return res.data || {};
    },
    enabled: Boolean(projectId),
  });
}

// Backward-compatible bulk save mutation
export function useSaveEnvVars(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<EnvironmentVariableDTO[], Error, SaveEnvVarsRequest>({
    mutationFn: async (payload) => {
      // Route via bulk endpoint
      await apiClient.post(
        `/api/v1/projects/${projectId}/env-vars/bulk`,
        payload.variables
      );
      const res = (await apiClient.get(
        `/api/v1/projects/${projectId}/env-vars`
      )) as unknown as ApiResponse<EnvironmentVariableDTO[]>;
      return res.data || [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: envVarsKeys.all });
    },
  });
}
