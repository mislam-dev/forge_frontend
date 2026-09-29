import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  ProjectRepositoryDTO,
  ConnectProjectRepositoryDTO,
  SaveRepositoryRequest,
  UpdateRepositoryRequest,
  GitValidationRequest,
  GitValidationResult,
  GitCommitDTO,
} from '@/lib/api/types';
import { projectsKeys } from './useProjects';

export const projectRepoKeys = {
  all: ['project-repo'] as const,
  detail: (projectId: string) => [...projectRepoKeys.all, 'detail', projectId] as const,
  branches: (projectId: string) => [...projectRepoKeys.all, 'branches', projectId] as const,
  commit: (projectId: string) => [...projectRepoKeys.all, 'commit', projectId] as const,
};

// 1. Get repository configuration: GET /api/v1/projects/:id/repository
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

// 2. Validate remote repository & credentials: POST /api/v1/projects/:id/repository/validate
export function useValidateRepository(projectId: string) {
  return useMutation<GitValidationResult, Error, GitValidationRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.post(
        `/api/v1/projects/${projectId}/repository/validate`,
        payload
      )) as unknown as ApiResponse<GitValidationResult>;
      return res.data;
    },
  });
}

// 3. Save / Link Repository: POST /api/v1/projects/:id/repository
export function useSaveProjectRepository(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectRepositoryDTO, Error, ConnectProjectRepositoryDTO>({
    mutationFn: async (payload) => {
      const body: ConnectProjectRepositoryDTO = {
        repository_url: payload.repository_url,
        default_branch: payload.default_branch ?? null,
        access_token: payload.access_token ?? null,
      };
      const res = (await apiClient.post(
        `/api/v1/projects/${projectId}/repository`,
        body
      )) as unknown as ApiResponse<ProjectRepositoryDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectRepoKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsKeys.detail(projectId) });
    },
  });
}

// Backward-compatible update repository hook
export function useUpdateProjectRepository(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectRepositoryDTO, Error, UpdateRepositoryRequest>({
    mutationFn: async (payload) => {
      const repositoryUrl = payload.repository_url || '';
      const branch = payload.default_branch || payload.branch || 'main';
      const accessToken = payload.access_token || payload.pat_token || null;

      const body: ConnectProjectRepositoryDTO = {
        repository_url: repositoryUrl,
        default_branch: branch,
        access_token: accessToken,
      };

      // Dispatches POST /api/v1/projects/:id/repository conforming to ConnectProjectRepositoryDTO
      const res = (await apiClient.post(
        `/api/v1/projects/${projectId}/repository`,
        body
      )) as unknown as ApiResponse<ProjectRepositoryDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectRepoKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsKeys.detail(projectId) });
    },
  });
}

// 4. Trigger Worker Clone: POST /api/v1/projects/:id/repository/clone
export function useCloneRepository(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<{ status: string; message: string }, Error, void>({
    mutationFn: async () => {
      const res = (await apiClient.post(
        `/api/v1/projects/${projectId}/repository/clone`
      )) as unknown as ApiResponse<{ status: string; message: string }>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectRepoKeys.detail(projectId) });
    },
  });
}

// 5. Fetch Latest Commit Metadata: GET /api/v1/projects/:id/repository/commit
export function useLatestCommit(projectId: string) {
  return useQuery<GitCommitDTO>({
    queryKey: projectRepoKeys.commit(projectId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/projects/${projectId}/repository/commit`)) as unknown as ApiResponse<GitCommitDTO>;
      return res.data;
    },
    enabled: Boolean(projectId),
  });
}

// 6. Switch Active Branch: PUT /api/v1/projects/:id/repository/branch
export function useSwitchBranch(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectRepositoryDTO, Error, string>({
    mutationFn: async (branch: string) => {
      const res = (await apiClient.put(`/api/v1/projects/${projectId}/repository/branch`, {
        branch,
      })) as unknown as ApiResponse<ProjectRepositoryDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectRepoKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectRepoKeys.commit(projectId) });
      queryClient.invalidateQueries({ queryKey: projectsKeys.detail(projectId) });
    },
  });
}

// 7. List Remote Branches: GET /api/v1/projects/:id/repository/branches
export function useRemoteBranches(projectId: string) {
  return useQuery<string[]>({
    queryKey: projectRepoKeys.branches(projectId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/projects/${projectId}/repository/branches`)) as unknown as ApiResponse<string[]>;
      return res.data || [];
    },
    enabled: Boolean(projectId),
  });
}
