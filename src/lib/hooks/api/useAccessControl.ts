import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  RoleDTO,
  PermissionDTO,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  AssignRolePermissionsRequest,
  AssignUserRolesRequest,
  AssignUserPermissionsRequest,
} from '@/lib/api/types';

export const accessControlKeys = {
  all: ['access-control'] as const,
  roles: () => [...accessControlKeys.all, 'roles'] as const,
  role: (id: string) => [...accessControlKeys.roles(), id] as const,
  permissions: () => [...accessControlKeys.all, 'permissions'] as const,
  permission: (id: string) => [...accessControlKeys.permissions(), id] as const,
  rolePermissions: (roleId: string) => [...accessControlKeys.role(roleId), 'permissions'] as const,
  userRoles: (userId: string) => [...accessControlKeys.all, 'users', userId, 'roles'] as const,
  userPermissions: (userId: string) => [...accessControlKeys.all, 'users', userId, 'permissions'] as const,
};

// ==========================================
// 1. Roles Management
// ==========================================

export function useSystemRolesList(page = 1, limit = 50, search?: string) {
  return useQuery<RoleDTO[]>({
    queryKey: [...accessControlKeys.roles(), { page, limit, search }],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit };
      if (search) params.search = search;
      const res = (await apiClient.get('/api/v1/access-control/roles', {
        params,
      })) as unknown as ApiResponse<RoleDTO[]>;
      return res.data || [];
    },
  });
}

export function useSystemRoleDetail(roleId: string) {
  return useQuery<RoleDTO>({
    queryKey: accessControlKeys.role(roleId),
    queryFn: async () => {
      const res = (await apiClient.get(
        `/api/v1/access-control/roles/${roleId}`
      )) as unknown as ApiResponse<RoleDTO>;
      return res.data;
    },
    enabled: Boolean(roleId),
  });
}

export function useCreateSystemRole() {
  const queryClient = useQueryClient();

  return useMutation<RoleDTO, Error, CreateRoleRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.post(
        '/api/v1/access-control/roles',
        payload
      )) as unknown as ApiResponse<RoleDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.roles() });
    },
  });
}

export function useUpdateSystemRole(roleId: string) {
  const queryClient = useQueryClient();

  return useMutation<RoleDTO, Error, UpdateRoleRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.patch(
        `/api/v1/access-control/roles/${roleId}`,
        payload
      )) as unknown as ApiResponse<RoleDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.roles() });
      queryClient.invalidateQueries({ queryKey: accessControlKeys.role(roleId) });
    },
  });
}

export function useDeleteSystemRole() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (roleId) => {
      await apiClient.delete(`/api/v1/access-control/roles/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.roles() });
    },
  });
}

// ==========================================
// 2. Permissions Management
// ==========================================

export function useSystemPermissionsList() {
  return useQuery<PermissionDTO[]>({
    queryKey: accessControlKeys.permissions(),
    queryFn: async () => {
      const res = (await apiClient.get(
        '/api/v1/access-control/permissions'
      )) as unknown as ApiResponse<PermissionDTO[]>;
      return res.data || [];
    },
  });
}

export function useSystemPermissionDetail(id: string) {
  return useQuery<PermissionDTO>({
    queryKey: accessControlKeys.permission(id),
    queryFn: async () => {
      const res = (await apiClient.get(
        `/api/v1/access-control/permissions/${id}`
      )) as unknown as ApiResponse<PermissionDTO>;
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateSystemPermission() {
  const queryClient = useQueryClient();

  return useMutation<PermissionDTO, Error, CreatePermissionRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.post(
        '/api/v1/access-control/permissions',
        payload
      )) as unknown as ApiResponse<PermissionDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.permissions() });
    },
  });
}

export function useUpdateSystemPermission(id: string) {
  const queryClient = useQueryClient();

  return useMutation<PermissionDTO, Error, UpdatePermissionRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.patch(
        `/api/v1/access-control/permissions/${id}`,
        payload
      )) as unknown as ApiResponse<PermissionDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.permissions() });
      queryClient.invalidateQueries({ queryKey: accessControlKeys.permission(id) });
    },
  });
}

export function useDeleteSystemPermission() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.delete(`/api/v1/access-control/permissions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.permissions() });
    },
  });
}

// ==========================================
// 3. Role-Permission Assignments
// ==========================================

export function useRolePermissions(roleId: string) {
  return useQuery<PermissionDTO[]>({
    queryKey: accessControlKeys.rolePermissions(roleId),
    queryFn: async () => {
      const res = (await apiClient.get(
        `/api/v1/access-control/roles/permissions/${roleId}`
      )) as unknown as ApiResponse<PermissionDTO[]>;
      return res.data || [];
    },
    enabled: Boolean(roleId),
  });
}

export function useAssignRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AssignRolePermissionsRequest>({
    mutationFn: async (payload) => {
      await apiClient.post('/api/v1/access-control/roles/permissions/assign', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.rolePermissions(variables.role_id) });
      queryClient.invalidateQueries({ queryKey: accessControlKeys.role(variables.role_id) });
    },
  });
}

export function useRemoveRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AssignRolePermissionsRequest>({
    mutationFn: async (payload) => {
      await apiClient.post('/api/v1/access-control/roles/permissions/remove', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.rolePermissions(variables.role_id) });
      queryClient.invalidateQueries({ queryKey: accessControlKeys.role(variables.role_id) });
    },
  });
}

// ==========================================
// 4. User-Role Assignments
// ==========================================

export function useUserAssignedRoles(userId: string) {
  return useQuery<RoleDTO[]>({
    queryKey: accessControlKeys.userRoles(userId),
    queryFn: async () => {
      const res = (await apiClient.get(
        `/api/v1/access-control/role/user/${userId}`
      )) as unknown as ApiResponse<RoleDTO[]>;
      return res.data || [];
    },
    enabled: Boolean(userId),
  });
}

export function useAssignUserRoles() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AssignUserRolesRequest>({
    mutationFn: async (payload) => {
      await apiClient.post('/api/v1/access-control/role/assign', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.userRoles(variables.user_id) });
    },
  });
}

export function useRemoveUserRoles() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AssignUserRolesRequest>({
    mutationFn: async (payload) => {
      await apiClient.post('/api/v1/access-control/role/remove', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.userRoles(variables.user_id) });
    },
  });
}

// ==========================================
// 5. User-Permission Direct Overrides
// ==========================================

export function useUserDirectPermissions(userId: string) {
  return useQuery<PermissionDTO[]>({
    queryKey: accessControlKeys.userPermissions(userId),
    queryFn: async () => {
      const res = (await apiClient.get(
        `/api/v1/access-control/users/permissions/${userId}`
      )) as unknown as ApiResponse<PermissionDTO[]>;
      return res.data || [];
    },
    enabled: Boolean(userId),
  });
}

export function useAssignUserDirectPermissions() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AssignUserPermissionsRequest>({
    mutationFn: async (payload) => {
      await apiClient.post('/api/v1/access-control/users/permission/assign', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.userPermissions(variables.user_id) });
    },
  });
}

export function useRemoveUserDirectPermissions() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, AssignUserPermissionsRequest>({
    mutationFn: async (payload) => {
      await apiClient.post('/api/v1/access-control/users/permission/remove', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: accessControlKeys.userPermissions(variables.user_id) });
    },
  });
}
