import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  TeamDTO,
  CreateTeamRequest,
  TeamMemberDTO,
  AddTeamMemberRequest,
} from '@/lib/api/types';

import { organizationsKeys } from '@/lib/hooks/api/useOrganizations';

export const teamsKeys = {
  all: ['teams'] as const,
  lists: () => [...teamsKeys.all, 'list'] as const,
  list: (orgId?: string) => [...teamsKeys.lists(), { orgId }] as const,
  detail: (id: string) => [...teamsKeys.all, 'detail', id] as const,
  members: (teamId: string) => [...teamsKeys.all, teamId, 'members'] as const,
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
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
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
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
    },
  });
}

export function useTeamMembers(teamId: string) {
  return useQuery<TeamMemberDTO[]>({
    queryKey: teamsKeys.members(teamId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/teams/${teamId}/members`)) as unknown as ApiResponse<TeamMemberDTO[]>;
      return res.data || [];
    },
    enabled: Boolean(teamId),
  });
}

export function useAddTeamMember(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation<TeamMemberDTO, Error, AddTeamMemberRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.post(
        `/api/v1/teams/${teamId}/members`,
        payload
      )) as unknown as ApiResponse<TeamMemberDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) });
      queryClient.invalidateQueries({ queryKey: teamsKeys.all });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
    },
  });
}

export function useRemoveTeamMember(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (memberId) => {
      await apiClient.delete(`/api/v1/teams/${teamId}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamsKeys.members(teamId) });
      queryClient.invalidateQueries({ queryKey: teamsKeys.all });
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
    },
  });
}
