import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  ProjectAccessDTO,
  AssignProjectRoleRequest,
} from '@/lib/api/types';

export const projectAccessKeys = {
  all: ['project-access'] as const,
  list: (projectId: string) => [...projectAccessKeys.all, projectId] as const,
};

export function useProjectAccess(projectId: string) {
  return useQuery<ProjectAccessDTO[]>({
    queryKey: projectAccessKeys.list(projectId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/projects/${projectId}/access`)) as unknown as ApiResponse<ProjectAccessDTO[]>;
      return res.data || [];
    },
    enabled: Boolean(projectId),
  });
}

export function useAssignProjectRole(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectAccessDTO, Error, AssignProjectRoleRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.post(
        `/api/v1/projects/${projectId}/access`,
        payload
      )) as unknown as ApiResponse<ProjectAccessDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectAccessKeys.list(projectId) });
    },
  });
}

export function useRevokeProjectRole(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (accessId) => {
      await apiClient.delete(`/api/v1/projects/${projectId}/access/${accessId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectAccessKeys.list(projectId) });
    },
  });
}
