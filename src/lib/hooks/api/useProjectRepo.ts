import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  ProjectRepositoryDTO,
  UpdateRepositoryRequest,
} from '@/lib/api/types';
import { projectsKeys } from './useProjects';

export const projectRepoKeys = {
  all: ['project-repo'] as const,
  detail: (projectId: string) => [...projectRepoKeys.all, projectId] as const,
};

export function useProjectRepository(projectId: string) {
  return useQuery<ProjectRepositoryDTO>({
    queryKey: projectRepoKeys.detail(projectId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/projects/${projectId}/repository`)) as unknown as ApiResponse<ProjectRepositoryDTO>;
      return res.data;
    },
    enabled: Boolean(projectId),
  });
}

export function useUpdateProjectRepository(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectRepositoryDTO, Error, UpdateRepositoryRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.put(`/api/v1/projects/${projectId}/repository`, payload)) as unknown as ApiResponse<ProjectRepositoryDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectRepoKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsKeys.detail(projectId) });
    },
  });
}
