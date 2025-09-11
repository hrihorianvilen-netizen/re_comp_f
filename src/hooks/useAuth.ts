import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

export function useUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await api.getMe();
      if (response.error) throw new Error(response.error);
      return response.data?.user;
    },
    retry: (failureCount, error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.login(credentials);
      if (response.error) throw new Error(response.error);
      
      if (response.data?.token) {
        api.setToken(response.data.token);
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      name?: string;
      displayName?: string;
    }) => {
      const response = await api.register(userData);
      if (response.error) throw new Error(response.error);
      
      if (response.data?.token) {
        api.setToken(response.data.token);
      }
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.logout();
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: {
      name?: string;
      displayName?: string;
      phone?: string;
      avatar?: File;
    }) => {
      const response = await api.updateProfile(userData);
      if (response.error) throw new Error(response.error);
      return response.data?.user;
    },
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        queryClient.setQueryData(authKeys.user(), updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const response = await api.changePassword(data);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.forgotPassword(email);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: {
      token: string;
      newPassword: string;
    }) => {
      const response = await api.resetPassword(data);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
}