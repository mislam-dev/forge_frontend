import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  TeamDTO,
  CreateTeamRequest,
} from '@/lib/api/types';

export const teamsKeys = {
  all: ['teams'] as const,
  lists: () => [...teamsKeys.all, 'list'] as const,
  list: (orgId?: string) => [...teamsKeys.lists(), { orgId }] as const,
  detail: (id: string) => [...teamsKeys.all, 'detail', id] as const,
};

export function useTeamsList(orgId?: string) {
  return useQuery<TeamDTO[]>({
    queryKey: teamsKeys.list(orgId),
    queryFn: async () => {
      const params = orgId ? { org_id: orgId } : undefined;
      const res = (await apiClient.get('/api/v1/teams', {
        params,
      })) as unknown as ApiResponse<TeamDTO[]>;
      return res.data || [];
    },
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation<TeamDTO, Error, CreateTeamRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.post('/api/v1/teams', payload)) as unknown as ApiResponse<TeamDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamsKeys.all });
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (teamId) => {
      await apiClient.delete(`/api/v1/teams/${teamId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamsKeys.all });
    },
  });
}
