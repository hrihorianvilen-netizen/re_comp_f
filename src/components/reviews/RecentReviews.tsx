import Link from 'next/link';
import { Review } from '@/types/api';
import { formatDistanceToNow } from 'date-fns';
import { RatingStars } from '@/components/ui';
import { CommentDisplay } from '@/components/comments';

interface RecentReviewsProps {
  reviews: Review[];
}

export default function RecentReviews({ reviews }: RecentReviewsProps) {
  const formatDate = (date: string | Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <section className="w-full bg-white">
      {/* Header */}
      <div className="p-4 pb-2">
        <h2 className="text-xl font-bold text-gray-900">Recent Reviews</h2>
      </div>
      
      {/* Review Cards */}
      <div className="space-y-4 p-4 pt-0">
        {reviews.slice(0, 4).map((review) => (
          <div key={review.id} className="bg-white border-b border-gray-200 pb-4 last:border-b-0">
            <div className="flex gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {(review.displayName || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* User info and rating */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {review.displayName || 'Anonymous'}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <RatingStars rating={review.rating} size={16} />
                      <span className="text-xs text-gray-600">
                        {review.rating}.0
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                
                {/* Merchant name */}
                <div className="mb-2">
                  <Link
                    href={`/merchants/${review.merchant?.slug || review.merchantId}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 truncate block"
                  >
                    {review.merchant?.name}
                  </Link>
                </div>
                
                {/* Review content */}
                <p className="text-sm text-gray-700 leading-relaxed break-words overflow-hidden mb-3">
                  <span className="block overflow-hidden text-ellipsis" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: '1.4'
                  }}>
                    {review.content.length > 120 
                      ? `${review.content.substring(0, 120)}...` 
                      : review.content}
                  </span>
                </p>

                {/* Comments Section */}
                {review.comments && review.comments.length > 0 && (
                  <CommentDisplay comments={review.comments} maxDisplay={2} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No reviews yet. Be the first to write one!</p>
        </div>
      )}
    </section>
  );
}