import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// Query Keys
interface AdminCommentFilters {
  page?: number;
  limit?: number;
  query?: string;
  status?: string;
  reaction?: string;
  dateFrom?: string;
  dateTo?: string;
  reviewId?: string;
}

export const adminCommentKeys = {
  all: ['admin-comments'] as const,
  lists: () => [...adminCommentKeys.all, 'list'] as const,
  list: (filters: AdminCommentFilters) => [...adminCommentKeys.lists(), filters] as const,
  details: () => [...adminCommentKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminCommentKeys.details(), id] as const,
};

// Hook to fetch admin comments
export function useAdminComments(filters: AdminCommentFilters = {}) {
  return useQuery({
    queryKey: adminCommentKeys.list(filters),
    queryFn: async () => {
      const response = await api.getAdminComments(filters);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
}

// Hook to fetch a single admin comment
export function useAdminComment(id: string) {
  return useQuery({
    queryKey: adminCommentKeys.detail(id),
    queryFn: async () => {
      const response = await api.getAdminComment(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    enabled: !!id,
  });
}

// Hook to update comment content
export function useUpdateAdminComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string; 
      data: { content?: string; displayName?: string; reaction?: string } 
    }) => {
      const response = await api.updateAdminComment(id, data);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // Invalidate admin comments list
      queryClient.invalidateQueries({ queryKey: adminCommentKeys.lists() });
      // Invalidate specific comment detail
      queryClient.invalidateQueries({ queryKey: adminCommentKeys.detail(id) });
    },
  });
}

// Hook to update comment status
export function useUpdateCommentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.updateCommentStatus(id, status);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate admin comments list
      queryClient.invalidateQueries({ queryKey: adminCommentKeys.lists() });
    },
  });
}

// Hook to perform bulk actions on comments
export function useBulkActionComments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ action, ids }: { action: string; ids: string[] }) => {
      const response = await api.bulkActionComments(action, ids);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate admin comments list
      queryClient.invalidateQueries({ queryKey: adminCommentKeys.lists() });
    },
  });
}

// Hook to delete admin comment
export function useDeleteAdminComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.deleteAdminComment(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate admin comments list
      queryClient.invalidateQueries({ queryKey: adminCommentKeys.lists() });
    },
  });
}