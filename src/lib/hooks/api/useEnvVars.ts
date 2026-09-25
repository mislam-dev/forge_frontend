import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  EnvironmentVariableDTO,
  SaveEnvVarsRequest,
} from '@/lib/api/types';

export const envVarsKeys = {
  all: ['env-vars'] as const,
  list: (projectId: string) => [...envVarsKeys.all, projectId] as const,
};

export function useProjectEnvVars(projectId: string) {
  return useQuery<EnvironmentVariableDTO[]>({
    queryKey: envVarsKeys.list(projectId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/projects/${projectId}/env-vars`)) as unknown as ApiResponse<EnvironmentVariableDTO[]>;
      return res.data || [];
    },
    enabled: Boolean(projectId),
  });
}

export function useSaveEnvVars(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<EnvironmentVariableDTO[], Error, SaveEnvVarsRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.put(`/api/v1/projects/${projectId}/env-vars`, payload)) as unknown as ApiResponse<EnvironmentVariableDTO[]>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: envVarsKeys.list(projectId) });
    },
  });
}
