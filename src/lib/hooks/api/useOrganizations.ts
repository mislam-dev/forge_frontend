import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  OrganizationDTO,
  CreateOrgRequest,
  OrgMemberDTO,
  InviteOrgMemberRequest,
  UpdateOrgMemberRoleRequest,
  TeamDTO,
} from '@/lib/api/types';

export const organizationsKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationsKeys.all, 'list'] as const,
  detail: (id: string) => [...organizationsKeys.all, 'detail', id] as const,
  members: (id: string) => [...organizationsKeys.all, 'members', id] as const,
  teams: (id: string) => [...organizationsKeys.all, 'teams', id] as const,
};

export function useOrganizationsList() {
  return useQuery<OrganizationDTO[]>({
    queryKey: organizationsKeys.lists(),
    queryFn: async () => {
      const res = (await apiClient.get('/api/v1/organizations')) as unknown as ApiResponse<OrganizationDTO[]>;
      return res.data || [];
    },
  });
}

export function useOrganizationDetail(orgId: string) {
  return useQuery<OrganizationDTO>({
    queryKey: organizationsKeys.detail(orgId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/organizations/${orgId}`)) as unknown as ApiResponse<OrganizationDTO>;
      return res.data;
    },
    enabled: Boolean(orgId),
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation<OrganizationDTO, Error, CreateOrgRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.post('/api/v1/organizations', payload)) as unknown as ApiResponse<OrganizationDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.all });
    },
  });
}

export function useOrgMembers(orgId: string) {
  return useQuery<OrgMemberDTO[]>({
    queryKey: organizationsKeys.members(orgId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/organizations/${orgId}/members`)) as unknown as ApiResponse<OrgMemberDTO[]>;
      return res.data || [];
    },
    enabled: Boolean(orgId),
  });
}

export function useInviteOrgMember(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation<OrgMemberDTO, Error, InviteOrgMemberRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.post(
        `/api/v1/organizations/${orgId}/invitations`,
        payload
      )) as unknown as ApiResponse<OrgMemberDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.members(orgId) });
    },
  });
}

export function useOrgTeams(orgId: string) {
  return useQuery<TeamDTO[]>({
    queryKey: organizationsKeys.teams(orgId),
    queryFn: async () => {
      const res = (await apiClient.get(`/api/v1/organizations/${orgId}/teams`)) as unknown as ApiResponse<TeamDTO[]>;
      return res.data || [];
    },
    enabled: Boolean(orgId),
  });
}

export function useRemoveOrgMember(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (memberId: string) => {
      await apiClient.delete(`/api/v1/organizations/${orgId}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.members(orgId) });
    },
  });
}

export function useUpdateOrgMemberRole(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation<OrgMemberDTO, Error, { memberId: string; role: string }>({
    mutationFn: async ({ memberId, role }) => {
      const res = (await apiClient.patch(
        `/api/v1/organizations/${orgId}/members/${memberId}`,
        { role }
      )) as unknown as ApiResponse<OrgMemberDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.members(orgId) });
    },
  });
}

