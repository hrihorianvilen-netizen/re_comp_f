import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export function useUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'suspended';
  sort?: 'newest' | 'oldest' | 'name';
}) {
  return useQuery({
    queryKey: userKeys.list(params || {}),
    queryFn: async () => {
      const response = await api.getUsers(params);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    retry: (failureCount, error) => {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('429')) {
        return failureCount < 3;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await api.getUserById(id);
      if (response.error) throw new Error(response.error);
      return response.data?.user;
    },
    enabled: !!id,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'suspended' }) => {
      const response = await api.updateUserStatus(id, status);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update user in cache
      if (data?.user) {
        queryClient.setQueryData(userKeys.detail(variables.id), data.user);
      }
      // Invalidate users list to refresh
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.deleteUser(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(variables) });
      // Invalidate users list to refresh
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useBulkActionUsers() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ action, ids }: { 
      action: 'suspend' | 'activate' | 'delete'; 
      ids: string[] 
    }) => {
      const response = await api.bulkActionUsers(action, ids);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all user queries to refresh data
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}