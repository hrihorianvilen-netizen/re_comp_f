import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Merchant } from '@/types/api';

// Query Keys
interface MerchantFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  excludeDrafts?: boolean;
}

export const merchantKeys = {
  all: ['merchants'] as const,
  lists: () => [...merchantKeys.all, 'list'] as const,
  list: (filters: MerchantFilters) => [...merchantKeys.lists(), filters] as const,
  details: () => [...merchantKeys.all, 'detail'] as const,
  detail: (slug: string) => [...merchantKeys.details(), slug] as const,
  reviews: (slug: string) => [...merchantKeys.all, 'reviews', slug] as const,
};

export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (reviewId: string) => [...commentKeys.lists(), reviewId] as const,
};

// Hook to fetch a single merchant
export function useMerchant(slug: string) {
  return useQuery({
    queryKey: merchantKeys.detail(slug),
    queryFn: async () => {
      const response = await api.getMerchant(slug);
      if (response.error) throw new Error(response.error);
      return response.data?.merchant;
    },
    enabled: !!slug,
  });
}

// Hook to fetch merchant reviews
export function useMerchantReviews(slug: string, limit: number = 50) {
  return useQuery({
    queryKey: merchantKeys.reviews(slug),
    queryFn: async () => {
      const response = await api.getReviews({ merchantSlug: slug, limit });
      if (response.error) throw new Error(response.error);
      return response.data?.reviews || [];
    },
    enabled: !!slug,
  });
}

// Hook to fetch merchants list
export function useMerchants(params?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
  excludeDrafts?: boolean;
}) {
  return useQuery({
    queryKey: merchantKeys.list(params || {}),
    queryFn: async () => {
      const response = await api.getMerchants(params);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
}

// Hook to fetch reviews (general)
export function useReviews(params?: {
  page?: number;
  limit?: number;
  merchantId?: string;
  merchantSlug?: string;
  rating?: number;
  sort?: string;
}) {
  return useQuery({
    queryKey: ['reviews', 'list', params],
    queryFn: async () => {
      const response = await api.getReviews(params);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
}

// Hook to track merchant visit
export function useTrackMerchantVisit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (slug: string) => {
      const response = await api.trackMerchantVisit(slug);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, slug) => {
      // Invalidate the merchant detail to get updated visitor count
      queryClient.invalidateQueries({ queryKey: merchantKeys.detail(slug) });
      // Also invalidate lists that might show visitor counts
      queryClient.invalidateQueries({ queryKey: merchantKeys.lists() });
    },
  });
}

// Hook to create a review
export function useCreateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      merchantId: string;
      merchantSlug: string;
      title: string;
      rating: number;
      content: string;
      displayName?: string;
      captchaToken?: string;
    }) => {
      const response = await api.createReview({
        merchantId: data.merchantId,
        title: data.title,
        rating: data.rating,
        content: data.content,
        displayName: data.displayName,
        captchaToken: data.captchaToken,
      });
      if (response.error) throw new Error(response.error);
      return { review: response.data?.review, merchantSlug: data.merchantSlug };
    },
    onSuccess: (data) => {
      if (data?.merchantSlug) {
        // Invalidate and refetch reviews for this merchant
        queryClient.invalidateQueries({ queryKey: merchantKeys.reviews(data.merchantSlug) });
        // Also invalidate merchant detail to update review count
        queryClient.invalidateQueries({ queryKey: merchantKeys.detail(data.merchantSlug) });
      }
    },
  });
}

// Hook to add comment to a review
export function useAddComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      reviewId, 
      merchantSlug,
      data 
    }: { 
      reviewId: string;
      merchantSlug: string;
      data: {
        reaction: '❤️' | '😢' | '😡';
        content?: string;
        displayName?: string;
        captchaToken?: string;
      };
    }) => {
      const response = await api.addComment(reviewId, data);
      if (response.error) throw new Error(response.error);
      return { comment: response.data?.comment, merchantSlug };
    },
    onSuccess: (data) => {
      if (data?.merchantSlug) {
        // Invalidate reviews to show the new comment
        queryClient.invalidateQueries({ queryKey: merchantKeys.reviews(data.merchantSlug) });
      }
    },
  });
}

// In-memory store for recently viewed merchants (React Query only, no localStorage)
let recentlyViewedStore: Merchant[] = [];

// Hook for recently viewed merchants (using React Query only)
export function useRecentlyViewed() {
  return useQuery({
    queryKey: ['recentlyViewed'],
    queryFn: () => {
      return recentlyViewedStore;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });
}

// Function to save to recently viewed (updates in-memory store)
export function saveToRecentlyViewed(merchant: Merchant): Promise<void> {
  return new Promise((resolve) => {
    if (!merchant) {
      resolve();
      return;
    }

    try {
      // Remove if already exists
      recentlyViewedStore = recentlyViewedStore.filter((item: Merchant) => item.id !== merchant.id);

      // Add to beginning
      recentlyViewedStore.unshift({
        id: merchant.id,
        slug: merchant.slug,
        name: merchant.name,
        logo: merchant.logo,
        rating: merchant.rating,
        weeklyVisits: merchant.weeklyVisits,
      } as Merchant);

      // Keep only last 10 items
      recentlyViewedStore = recentlyViewedStore.slice(0, 10);
      resolve();
    } catch (error) {
      console.error('Failed to save to recently viewed:', error);
      resolve();
    }
  });
}

// Hook to update recently viewed with React Query mutation
export function useUpdateRecentlyViewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveToRecentlyViewed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentlyViewed'] });
    },
  });
}

// ==== COMMENT HOOKS ====

// Hook to fetch comments for a review
export function useComments(reviewId: string) {
  return useQuery({
    queryKey: commentKeys.list(reviewId),
    queryFn: async () => {
      const response = await api.getComments(reviewId);
      if (response.error) throw new Error(response.error);
      return response.data?.comments || [];
    },
    enabled: !!reviewId,
  });
}

// Hook to update a comment
export function useUpdateComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      commentId, 
      reviewId,
      data 
    }: { 
      commentId: string;
      reviewId: string;
      data: {
        reaction?: '❤️' | '😢' | '😡';
        content?: string;
      };
    }) => {
      const response = await api.updateComment(commentId, data);
      if (response.error) throw new Error(response.error);
      return { comment: response.data?.comment, reviewId };
    },
    onSuccess: (data) => {
      if (data?.reviewId) {
        // Invalidate comments for this review
        queryClient.invalidateQueries({ queryKey: commentKeys.list(data.reviewId) });
        // Also invalidate reviews to show updated comment counts
        queryClient.invalidateQueries({ queryKey: merchantKeys.all });
      }
    },
  });
}

// Hook to delete a comment
export function useDeleteComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, reviewId }: { commentId: string; reviewId: string }) => {
      const response = await api.deleteComment(commentId);
      if (response.error) throw new Error(response.error);
      return { reviewId };
    },
    onSuccess: (data) => {
      if (data?.reviewId) {
        // Invalidate comments for this review
        queryClient.invalidateQueries({ queryKey: commentKeys.list(data.reviewId) });
        // Also invalidate reviews to show updated comment counts
        queryClient.invalidateQueries({ queryKey: merchantKeys.all });
      }
    },
  });
}

// Hook to report a comment
export function useReportComment() {
  return useMutation({
    mutationFn: async ({ commentId, reason }: { commentId: string; reason?: string }) => {
      const response = await api.reportComment(commentId, reason);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
}

// ==== ADMIN REVIEW HOOKS ====

export const adminReviewKeys = {
  all: ['admin', 'reviews'] as const,
  lists: () => [...adminReviewKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...adminReviewKeys.lists(), filters] as const,
  details: () => [...adminReviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminReviewKeys.details(), id] as const,
};

// Hook to fetch admin reviews
export function useAdminReviews(params?: {
  page?: number;
  limit?: number;
  query?: string;
  merchant?: string;
  rating?: number;
  dateFrom?: string;
  dateTo?: string;
  status?: 'published' | 'spam' | 'trash' | 'pending';
}) {
  return useQuery({
    queryKey: adminReviewKeys.list(params || {}),
    queryFn: async () => {
      const response = await api.getAdminReviews(params);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
  });
}

// Hook to fetch single admin review
export function useAdminReview(id: string) {
  return useQuery({
    queryKey: adminReviewKeys.detail(id),
    queryFn: async () => {
      const response = await api.getAdminReview(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    enabled: !!id,
  });
}

// Hook to update review status
export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'published' | 'spam' | 'trash' | 'pending' }) => {
      const response = await api.updateReviewStatus(id, status);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      // Invalidate admin reviews list
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.lists() });
      // Invalidate specific review detail
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.detail(id) });
    },
  });
}

// Hook to toggle review feature
export function useToggleReviewFeature() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.toggleReviewFeature(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: (_, id) => {
      // Invalidate admin reviews list
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.lists() });
      // Invalidate specific review detail
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.detail(id) });
    },
  });
}

// Hook for bulk actions on reviews
export function useBulkActionReviews() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ action, ids }: { action: 'publish' | 'spam' | 'trash'; ids: string[] }) => {
      const response = await api.bulkActionReviews(action, ids);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate admin reviews list
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.lists() });
    },
  });
}

// Hook to update admin review content
export function useUpdateAdminReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title: string; content: string } }) => {
      console.log('useUpdateAdminReview: Starting mutation with:', { id, data });
      
      try {
        const response = await api.updateAdminReview(id, data);
        console.log('useUpdateAdminReview: API response received:', response);
        
        if (!response) {
          console.error('useUpdateAdminReview: No response received from server');
          throw new Error('No response received from server');
        }
        
        if (response.error) {
          console.error('useUpdateAdminReview: API returned error:', response.error);
          // The error should always be a string now from the API client
          const errorMessage = typeof response.error === 'string' 
            ? response.error 
            : 'Failed to update review';
          throw new Error(errorMessage);
        }
        
        console.log('useUpdateAdminReview: Success, returning data:', response.data);
        return response.data;
      } catch (error) {
        console.error('useUpdateAdminReview: Caught error:', error);
        throw error; // Re-throw to let the component handle it
      }
    },
    onSuccess: (_, { id }) => {
      // Invalidate admin reviews list
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.lists() });
      // Invalidate specific review detail
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.detail(id) });
    },
  });
}

// Hook to delete admin review
export function useDeleteAdminReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.deleteAdminReview(id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate admin reviews list
      queryClient.invalidateQueries({ queryKey: adminReviewKeys.lists() });
    },
  });
}