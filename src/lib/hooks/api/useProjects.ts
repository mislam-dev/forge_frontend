import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  PaginatedResponse,
  ProjectDTO,
  CreateProjectRequest,
} from '@/lib/api/types';

export const projectsKeys = {
  all: ['projects'] as const,
  lists: () => [...projectsKeys.all, 'list'] as const,
  list: (orgId?: string) => [...projectsKeys.lists(), { orgId }] as const,
  details: () => [...projectsKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectsKeys.details(), id] as const,
};

export function useProjectsList(orgId?: string) {
  return useQuery<ProjectDTO[]>({
    queryKey: projectsKeys.list(orgId),
    queryFn: async () => {
      const params = orgId ? { org_id: orgId } : undefined;
      const res = (await apiClient.get('/api/v1/projects', {
        params,
      })) as unknown as ApiResponse<ProjectDTO[] | PaginatedResponse<ProjectDTO>>;
      
      if (Array.isArray(res.data)) {
        return res.data;
      }
      if (res.data && 'items' in res.data) {
        return res.data.items;
      }
      return [];
    },
  });
}

export function useProjectDetail(projectId: string) {
  return useQuery<ProjectDTO>({
    queryKey: projectsKeys.detail(projectId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/projects/${projectId}`)) as unknown as ApiResponse<ProjectDTO>;
      return res.data;
    },
    enabled: Boolean(projectId),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation<ProjectDTO, Error, CreateProjectRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.post('/api/v1/projects', payload)) as unknown as ApiResponse<ProjectDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectDTO, Error, Partial<CreateProjectRequest>>({
    mutationFn: async (payload) => {
      const res = (await apiClient.put(`/api/v1/projects/${projectId}`, payload)) as unknown as ApiResponse<ProjectDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
      queryClient.invalidateQueries({ queryKey: projectsKeys.detail(projectId) });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (projectId) => {
      await apiClient.delete(`/api/v1/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
    },
  });
}
