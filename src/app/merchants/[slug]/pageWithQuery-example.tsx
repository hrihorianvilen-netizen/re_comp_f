'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  useMerchant, 
  useMerchantReviews, 
  useTrackMerchantVisit,
  useCreateReview,
  useAddComment,
  saveToRecentlyViewed
} from '@/hooks/useMerchants';

// This is a simplified example showing how to use React Query in the merchant detail page
export default function MerchantDetailPageWithQuery() {
  const params = useParams();
  const slug = params?.slug as string;
  
  // React Query hooks
  const { data: merchant, isLoading: merchantLoading, error: merchantError } = useMerchant(slug);
  const { data: reviews = [], isLoading: reviewsLoading } = useMerchantReviews(slug);
  const trackVisitMutation = useTrackMerchantVisit();
  const createReviewMutation = useCreateReview();
  const addCommentMutation = useAddComment();
  
  // Track visit when merchant loads
  useEffect(() => {
    if (merchant && slug) {
      // Track the visit
      trackVisitMutation.mutate(slug);
      // Save to recently viewed
      saveToRecentlyViewed(merchant);
    }
  }, [merchant, slug]);
  
  // Handle review submission
  const handleReviewSubmit = async (data: any) => {
    if (!merchant) return;
    
    try {
      await createReviewMutation.mutateAsync({
        merchantId: merchant.id,
        merchantSlug: slug,
        title: data.title,
        rating: data.rating,
        content: data.content,
        displayName: data.displayName,
      });
      
      alert('Review submitted successfully!');
      // Review list will automatically refresh due to query invalidation
    } catch (error) {
      alert('Failed to submit review. Please try again.');
    }
  };
  
  // Handle comment submission
  const handleCommentSubmit = async (reviewId: string, data: any) => {
    try {
      await addCommentMutation.mutateAsync({
        reviewId,
        merchantSlug: slug,
        data: {
          reaction: data.selectedReaction || '❤️',
          content: data.content,
          displayName: data.title || 'Anonymous User',
        },
      });
      
      alert('Comment submitted successfully!');
      // Comments will automatically refresh due to query invalidation
    } catch (error) {
      alert('Failed to submit comment. Please try again.');
    }
  };
  
  // Loading state
  if (merchantLoading || reviewsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#198639] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading merchant information...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (merchantError || !merchant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Merchant Not Found</h2>
          <p className="text-gray-600 mb-4">
            {merchantError?.message || 'The merchant you are looking for does not exist.'}
          </p>
        </div>
      </div>
    );
  }
  
  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Display merchant data */}
      <h1>{merchant.name}</h1>
      <p>Weekly Visits: {(merchant.weeklyVisits || 0).toLocaleString()}</p>
      <p>Reviews: {reviews.length}</p>
      
      {/* The rest of your component UI goes here... */}
      {/* You can use the mutation states for loading indicators */}
      {createReviewMutation.isPending && <p>Submitting review...</p>}
      {addCommentMutation.isPending && <p>Adding comment...</p>}
    </div>
  );
}