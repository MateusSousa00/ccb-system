import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';
import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserResponse,
} from '@/types';

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<AuthResponse> => {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      Cookies.set('auth_token', data.accessToken, { expires: 7 }); // 7 days
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/simulations');
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<AuthResponse> => {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
      return response.data.data;
    },
    onSuccess: (data) => {
      Cookies.set('auth_token', data.accessToken, { expires: 7 }); // 7 days
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/simulations');
    },
  });
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<UserResponse> => {
      const response = await api.get<ApiResponse<UserResponse>>('/auth/me');
      return response.data.data;
    },
    enabled: !!Cookies.get('auth_token'),
    retry: false,
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    Cookies.remove('auth_token');
    queryClient.clear();
    router.push('/login');
  };
}
