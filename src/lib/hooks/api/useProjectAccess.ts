import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  ProjectMemberDTO,
  ProjectTeamDTO,
  AssignProjectMemberRequest,
  AssignProjectTeamRequest,
  ProjectAccessDTO,
  AssignProjectRoleRequest,
} from '@/lib/api/types';

export const projectAccessKeys = {
  all: ['project-access'] as const,
  members: (projectId: string) => [...projectAccessKeys.all, 'members', projectId] as const,
  teams: (projectId: string) => [...projectAccessKeys.all, 'teams', projectId] as const,
  combined: (projectId: string) => [...projectAccessKeys.all, 'combined', projectId] as const,
};

// 1. List assigned members: GET /api/v1/projects/:id/members
export function useProjectMembers(projectId: string) {
  return useQuery<ProjectMemberDTO[]>({
    queryKey: projectAccessKeys.members(projectId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/projects/${projectId}/members`)) as unknown as ApiResponse<ProjectMemberDTO[]>;
      return res.data || [];
    },
    enabled: Boolean(projectId),
  });
}

// 2. Assign member: POST /api/v1/projects/:id/members
export function useAssignProjectMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectMemberDTO, Error, AssignProjectMemberRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.post(
        `/api/v1/projects/${projectId}/members`,
        payload
      )) as unknown as ApiResponse<ProjectMemberDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectAccessKeys.members(projectId) });
      queryClient.invalidateQueries({ queryKey: projectAccessKeys.combined(projectId) });
    },
  });
}

// 3. Remove member: DELETE /api/v1/projects/:id/members/:user_id
export function useRemoveProjectMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/api/v1/projects/${projectId}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectAccessKeys.members(projectId) });
      queryClient.invalidateQueries({ queryKey: projectAccessKeys.combined(projectId) });
    },
  });
}

// 4. List assigned teams: GET /api/v1/projects/:id/teams
export function useProjectTeams(projectId: string) {
  return useQuery<ProjectTeamDTO[]>({
    queryKey: projectAccessKeys.teams(projectId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/projects/${projectId}/teams`)) as unknown as ApiResponse<ProjectTeamDTO[]>;
      return res.data || [];
    },
    enabled: Boolean(projectId),
  });
}

// 5. Assign team: POST /api/v1/projects/:id/teams
export function useAssignProjectTeam(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<ProjectTeamDTO, Error, AssignProjectTeamRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.post(
        `/api/v1/projects/${projectId}/teams`,
        payload
      )) as unknown as ApiResponse<ProjectTeamDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectAccessKeys.teams(projectId) });
      queryClient.invalidateQueries({ queryKey: projectAccessKeys.combined(projectId) });
    },
  });
}

// 6. Remove team: DELETE /api/v1/projects/:id/teams/:team_id
export function useRemoveProjectTeam(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (teamId: string) => {
      await apiClient.delete(`/api/v1/projects/${projectId}/teams/${teamId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectAccessKeys.teams(projectId) });
      queryClient.invalidateQueries({ queryKey: projectAccessKeys.combined(projectId) });
    },
  });
}

// Backward-compatible unified access query for existing access management views
export function useProjectAccess(projectId: string) {
  return useQuery<ProjectAccessDTO[]>({
    queryKey: projectAccessKeys.combined(projectId),
    queryFn: async () => {
      const [membersRes, teamsRes] = await Promise.allSettled([
        apiClient.get(`/api/v1/projects/${projectId}/members`),
        apiClient.get(`/api/v1/projects/${projectId}/teams`),
      ]);

      const items: ProjectAccessDTO[] = [];

      if (membersRes.status === 'fulfilled') {
        const data = (membersRes.value as any)?.data || [];
        if (Array.isArray(data)) {
          data.forEach((m: ProjectMemberDTO) => {
            items.push({
              id: m.id || m.user_id,
              project_id: projectId,
              user_id: m.user_id,
              name: m.name,
              type: 'user',
              role: m.role as any,
              created_at: m.created_at || new Date().toISOString(),
            });
          });
        }
      }

      if (teamsRes.status === 'fulfilled') {
        const data = (teamsRes.value as any)?.data || [];
        if (Array.isArray(data)) {
          data.forEach((t: ProjectTeamDTO) => {
            items.push({
              id: t.id || t.team_id,
              project_id: projectId,
              team_id: t.team_id,
              name: t.name,
              type: 'team',
              role: t.role as any,
              created_at: t.created_at || new Date().toISOString(),
            });
          });
        }
      }

      return items;
    },
    enabled: Boolean(projectId),
  });
}

// Backward-compatible assign and revoke
export function useAssignProjectRole(projectId: string) {
  const assignMember = useAssignProjectMember(projectId);
  const assignTeam = useAssignProjectTeam(projectId);

  return useMutation<unknown, Error, AssignProjectRoleRequest>({
    mutationFn: async (payload) => {
      if (payload.target_type === 'user') {
        return assignMember.mutateAsync({
          user_id: payload.target_id,
          role: payload.role.toLowerCase(),
        });
      } else {
        return assignTeam.mutateAsync({
          team_id: payload.target_id,
          role: payload.role.toLowerCase(),
        });
      }
    },
  });
}

export function useRevokeProjectRole(projectId: string) {
  const removeMember = useRemoveProjectMember(projectId);
  const removeTeam = useRemoveProjectTeam(projectId);

  return useMutation<void, Error, string | { id: string; type?: 'user' | 'team' }>({
    mutationFn: async (arg) => {
      const id = typeof arg === 'string' ? arg : arg.id;
      const type = typeof arg === 'string' ? 'user' : arg.type || 'user';
      if (type === 'user') {
        await removeMember.mutateAsync(id);
      } else {
        await removeTeam.mutateAsync(id);
      }
    },
  });
}
