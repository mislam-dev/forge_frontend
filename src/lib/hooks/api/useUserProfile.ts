import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  UserProfileDTO,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserSessionDTO,
} from '@/lib/api/types';

export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  sessions: () => [...userKeys.all, 'sessions'] as const,
};

export function useUserProfile() {
  return useQuery<UserProfileDTO>({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const res = (await apiClient.get('/api/v1/users/me')) as unknown as ApiResponse<UserProfileDTO>;
      return res.data;
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserProfileDTO, Error, UpdateProfileRequest>({
    mutationFn: async (payload) => {
      const res = (await apiClient.patch('/api/v1/users/me', payload)) as unknown as ApiResponse<UserProfileDTO>;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

export function useChangePassword() {
  return useMutation<void, Error, ChangePasswordRequest>({
    mutationFn: async (payload) => {
      await apiClient.post('/api/v1/users/me/password', payload);
    },
  });
}

export function useActiveSessions() {
  return useQuery<UserSessionDTO[]>({
    queryKey: userKeys.sessions(),
    queryFn: async () => {
      const res = (await apiClient.get('/api/v1/users/me/sessions')) as unknown as ApiResponse<UserSessionDTO[]>;
      return res.data || [];
    },
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (sessionId) => {
      await apiClient.delete(`/api/v1/users/me/sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.sessions() });
    },
  });
}
