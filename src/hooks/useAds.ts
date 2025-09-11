import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const adsKeys = {
  all: ['ads'] as const,
  lists: () => [...adsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...adsKeys.lists(), filters] as const,
  details: () => [...adsKeys.all, 'detail'] as const,
  detail: (id: string) => [...adsKeys.details(), id] as const,
};

export function useAds(params?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive' | 'pending';
  type?: 'banner' | 'sidebar' | 'popup';
}) {
  return useQuery({
    queryKey: adsKeys.list(params || {}),
    queryFn: async () => {
      const response = await api.getAds(params);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (adData: {
      title: string;
      description?: string;
      imageUrl?: string;
      link?: string;
      type: 'banner' | 'sidebar' | 'popup';
      status: 'active' | 'inactive' | 'pending';
    }) => {
      const response = await api.createAd(adData);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adsKeys.lists() });
    },
  });
}

export function useUpdateAd() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string; 
      data: {
        title?: string;
        description?: string;
        imageUrl?: string;
        link?: string;
        type?: 'banner' | 'sidebar' | 'popup';
        status?: 'active' | 'inactive' | 'pending';
      }
    }) => {
      const response = await api.updateAd(id, data);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adsKeys.detail(id) });
    },
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.deleteAd(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adsKeys.lists() });
    },
  });
}