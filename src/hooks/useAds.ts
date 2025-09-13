import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Advertisement } from '@/types/api';

export const adsKeys = {
  all: ['ads'] as const,
  lists: () => [...adsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...adsKeys.lists(), filters] as const,
  details: () => [...adsKeys.all, 'detail'] as const,
  detail: (id: string) => [...adsKeys.details(), id] as const,
  metrics: (id: string) => [...adsKeys.all, 'metrics', id] as const,
};

interface AdsListParams {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'archive' | 'trash';
  slot?: 'top' | 'sidebar' | 'footer' | 'inline';
  merchantId?: string;
  sortBy?: 'createdAt' | 'order' | 'impressions' | 'clicks' | 'ctr';
  sortOrder?: 'asc' | 'desc';
}

interface AdsListResponse {
  ads: Advertisement[];
  total: number;
  page: number;
  totalPages: number;
}

export function useAds(params?: AdsListParams) {
  return useQuery<AdsListResponse>({
    queryKey: adsKeys.list((params || {}) as Record<string, unknown>),
    queryFn: async () => {
      const response = await api.getAds(params);
      if (response.error) throw new Error(response.error);
      return response.data as AdsListResponse;
    },
  });
}

export function useAd(id: string) {
  return useQuery<Advertisement & { recentMetrics?: Array<{ date: string; impressions: number; clicks: number }> }>({
    queryKey: adsKeys.detail(id),
    queryFn: async () => {
      const response = await api.getAd(id);
      if (response.error) throw new Error(response.error);
      return response.data?.ad as (Advertisement & { recentMetrics?: Array<{ date: string; impressions: number; clicks: number }> });
    },
    enabled: !!id,
  });
}

interface CreateAdData {
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  merchantId?: string;
  slot: 'top' | 'sidebar' | 'footer' | 'inline';
  order?: number;
  duration: '1d' | '3d' | '7d' | '2w' | '1m' | '2m' | '3m' | 'custom';
  startDate?: string;
  endDate?: string;
  status?: 'draft' | 'published';
}

export function useCreateAd() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (adData: CreateAdData) => {
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAdData> }) => {
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

export function usePublishAd() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.publishAd(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adsKeys.detail(id) });
    },
  });
}

export function useArchiveAd() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.archiveAd(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adsKeys.detail(id) });
    },
  });
}

export function useRestoreAd() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.restoreAd(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adsKeys.detail(id) });
    },
  });
}

export function usePermanentDeleteAd() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.permanentDeleteAd(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adsKeys.lists() });
    },
  });
}

// Public display hooks
export function useDisplayAds(slot: 'top' | 'sidebar' | 'footer' | 'inline', merchantId?: string) {
  return useQuery({
    queryKey: ['ads', 'display', slot, merchantId],
    queryFn: async () => {
      const response = await api.getDisplayAds(slot, merchantId);
      if (response.error) throw new Error(response.error);
      return response.data as { ads: Advertisement[] };
    },
  });
}

export function useTrackClick() {
  return useMutation({
    mutationFn: async (adId: string) => {
      const response = await api.trackAdClick(adId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
}