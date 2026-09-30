import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import {
  ApiResponse,
  UserProfileDTO,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserSessionDTO,
  MeResponseDto,
} from '@/lib/api/types';

export const userKeys = {
  all: ['user'] as const,
  profile: () => ['auth', 'me'] as const,
  me: () => ['auth', 'me'] as const,
  sessions: () => [...userKeys.all, 'sessions'] as const,
};

export interface EnrichedMeResponse extends MeResponseDto {
  user_id?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  image?: string;
}

export function parseMeResponse(res: unknown): EnrichedMeResponse {
  if (!res || typeof res !== 'object') {
    throw new Error('Invalid response from /api/v1/auth/me');
  }
  const payload = (res as { data?: MeResponseDto }).data?.id
    ? (res as { data: MeResponseDto }).data
    : (res as MeResponseDto);

  const nameParts = (payload.name || '').trim().split(/\s+/);
  const first_name = nameParts[0] || '';
  const last_name = nameParts.slice(1).join(' ') || '';

  const enriched: EnrichedMeResponse = {
    ...payload,
    user_id: payload.id,
    first_name,
    last_name,
  };

  if (typeof window !== 'undefined' && payload?.id) {
    try {
      localStorage.setItem('forge_user_profile', JSON.stringify(enriched));
    } catch {
      // ignore storage quota / sandbox issues
    }
  }

  return enriched;
}

export function useCurrentUser() {
  return useQuery<EnrichedMeResponse>({
    queryKey: userKeys.me(),
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/auth/me');
      return parseMeResponse(res);
    },
  });
}

export function useUserProfile() {
  return useCurrentUser();
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

export const STATIC_SESSIONS: UserSessionDTO[] = [
  {
    id: 'sess-1',
    device: 'MacBook Pro 16" (Current)',
    browser: 'Chrome 128.0 (macOS)',
    ip_address: '192.168.1.45',
    is_current: true,
    last_active: 'Active now',
  },
  {
    id: 'sess-2',
    device: 'iPhone 15 Pro',
    browser: 'Mobile Safari 17.4 (iOS)',
    ip_address: '10.0.0.12',
    is_current: false,
    last_active: '2 hours ago',
  },
];

export function useActiveSessions() {
  return useQuery<UserSessionDTO[]>({
    queryKey: userKeys.sessions(),
    queryFn: async () => {
      return STATIC_SESSIONS;
    },
    initialData: STATIC_SESSIONS,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (sessionId) => {
      queryClient.setQueryData<UserSessionDTO[]>(userKeys.sessions(), (old = STATIC_SESSIONS) =>
        old.filter((s) => s.id !== sessionId)
      );
    },
  });
}

