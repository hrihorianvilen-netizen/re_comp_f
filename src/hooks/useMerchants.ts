import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Merchant, Review, ReviewComment } from '@/types/api';

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
    }) => {
      const response = await api.createReview({
        merchantId: data.merchantId,
        title: data.title,
        rating: data.rating,
        content: data.content,
        displayName: data.displayName,
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

// Hook for recently viewed merchants (using localStorage + React Query)
export function useRecentlyViewed() {
  return useQuery({
    queryKey: ['recentlyViewed'],
    queryFn: () => {
      if (typeof window === 'undefined') return [];
      const stored = localStorage.getItem('recentlyViewed');
      return stored ? JSON.parse(stored) : [];
    },
    staleTime: 0, // Always check localStorage
    gcTime: 0, // Don't cache
  });
}

// Function to save to recently viewed (can be called directly)
export function saveToRecentlyViewed(merchant: Merchant) {
  if (typeof window === 'undefined' || !merchant) return;
  
  try {
    const stored = localStorage.getItem('recentlyViewed');
    let recentlyViewed = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists
    recentlyViewed = recentlyViewed.filter((item: Merchant) => item.id !== merchant.id);
    
    // Add to beginning
    recentlyViewed.unshift({
      id: merchant.id,
      slug: merchant.slug,
      name: merchant.name,
      logo: merchant.logo,
      rating: merchant.rating,
      weeklyVisits: merchant.weeklyVisits,
    });
    
    // Keep only last 10 items
    recentlyViewed = recentlyViewed.slice(0, 10);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  } catch (error) {
    console.error('Failed to save to recently viewed:', error);
  }
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