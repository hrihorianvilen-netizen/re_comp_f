'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Review, Comment, Merchant } from '@/types';
import RatingStars from '@/components/RatingStars';
import CommentForm, { CommentFormData } from '@/components/CommentForm';
import { getApiReaction, getReactionEmoji } from '@/lib/reactions';
import api from '@/lib/api';

// Mock data for reviews with slugs
const mockReviewData = {
  'outstanding-service-lightning-fast-delivery': {
    id: '1',
    slug: 'outstanding-service-lightning-fast-delivery',
  merchantId: '1',
  displayName: 'John D.',
  rating: 5,
  title: 'Outstanding Service and Lightning-Fast Delivery!',
  content: `I recently purchased a laptop from TechStore Pro and I couldn't be happier with my experience. The entire process, from browsing their website to receiving my order, was seamless and professional.

The website is user-friendly and well-organized, making it easy to find exactly what I was looking for. Product descriptions were detailed and accurate, with clear specifications and multiple photos from different angles. This really helped me make an informed decision.

What impressed me most was their customer service. I had a few questions about compatibility with my existing setup, and their support team responded within hours with detailed, helpful answers. They even followed up after my purchase to ensure everything was working well.

The shipping was incredibly fast - I received my order within 2 business days, even though I selected standard shipping. The packaging was secure and professional, with plenty of protection to ensure the laptop arrived in perfect condition.

The laptop itself exceeded my expectations. It was exactly as described, came with all the promised accessories, and was clearly a genuine product with valid warranty information. The price was competitive, and they even included a surprise discount code for my next purchase.

I've already recommended TechStore Pro to several friends and will definitely be shopping here again. This is how online shopping should be - transparent, efficient, and customer-focused.`,
  helpful: 12,
  notHelpful: 1,
  createdAt: new Date('2024-01-25'),
  updatedAt: new Date('2024-01-25'),
    merchant: {
      id: '1',
      slug: 'techstore-pro',
      name: 'TechStore Pro',
      description: 'Leading technology retailer',
      category: 'Technology',
      rating: 4.5,
      reviewCount: 1250,
      status: 'recommended',
      logo: '/images/shopee.jpg',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-25'),
    },
  comments: [
    {
      id: '1',
      reviewId: '1',
      displayName: 'Store Owner',
      reaction: 'helpful',
      content: 'Thank you so much for taking the time to share your detailed experience! We\'re thrilled to hear that you had such a positive experience with our store. Customer satisfaction is our top priority, and feedback like yours motivates our entire team. We look forward to serving you again!',
      createdAt: new Date('2024-01-26'),
    },
    {
      id: '2',
      reviewId: '1',
      displayName: 'Sarah M.',
      reaction: 'helpful',
      content: 'Thanks for this detailed review! I was hesitant about ordering from them but your experience convinced me to give them a try.',
      createdAt: new Date('2024-01-27'),
    },
  ],
  }
};

export default function ReviewDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  // Find review by slug, default to first review if not found
  const mockReview = Object.values(mockReviewData).find(review => review.slug === slug) || Object.values(mockReviewData)[0];
  
  const [review, setReview] = useState<Review & { merchant?: Merchant }>(mockReview);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [reactionCounts, setReactionCounts] = useState({
    love: review.helpful || 0,
    cry: review.notHelpful || 0,
    angry: 0,
  });
  const [userReactions, setUserReactions] = useState<{[key: string]: boolean}>({});
  const [showFullContent, setShowFullContent] = useState(false);
  const [reportReason, setReportReason] = useState<string>('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);
    
    if (diffInMins < 1) return 'just now';
    if (diffInMins < 60) return `${diffInMins} minutes ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays < 30) return `${diffInDays} days ago`;
    return formatDate(date);
  };

  const handleCommentSubmit = async (data: CommentFormData) => {
    try {
      // Convert emotion reaction to the format expected by the API
      const reaction = data.selectedReaction ? getApiReaction(data.selectedReaction) : '❤️';
      
      // Call the API to submit the comment
      const result = await api.addComment(review.id, {
        reaction,
        content: data.content,
        displayName: data.title || 'Anonymous User', // Use title as display name since API doesn't have title field
      });
      
      if (result.error) {
        alert(`Failed to submit comment: ${result.error}`);
        return;
      }
      
      // Use the comment returned from the backend
      const newComment = result.data.comment;
      
      // Update local state
      setReview({
        ...review,
        comments: [...(review.comments || []), newComment],
      });
      
      setShowCommentForm(false);
      alert('Comment submitted successfully!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    }
  };

  const handleReaction = (type: 'love' | 'cry' | 'angry') => {
    if (userReactions[type]) {
      // User already reacted, remove reaction
      setReactionCounts(prev => ({
        ...prev,
        [type]: Math.max(0, prev[type] - 1),
      }));
      setUserReactions(prev => ({
        ...prev,
        [type]: false,
      }));
    } else {
      // Add reaction
      setReactionCounts(prev => ({
        ...prev,
        [type]: prev[type] + 1,
      }));
      setUserReactions(prev => ({
        ...prev,
        [type]: true,
      }));
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In a real app, this would save to user's bookmarks
  };

  const handleShare = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    setShareUrl(currentUrl);
    setShowShareModal(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
      setShowShareModal(false);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleReport = () => {
    if (reportReason.trim()) {
      // In a real app, this would send a report to moderators
      console.log('Review reported for:', reportReason);
      alert('Thank you for your report. Our moderators will review this content.');
      setShowReportModal(false);
      setReportReason('');
    }
  };

  const handleReadMore = () => {
    setShowFullContent(!showFullContent);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/merchants" className="text-gray-500 hover:text-gray-700">
              Merchants
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href={`/merchants/${review.merchant?.slug || review.merchantId}`} className="text-gray-500 hover:text-gray-700">
              {review.merchant?.name}
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">Review</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Review Detail */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Merchant Info */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6 mb-6 pb-6 border-b">
            <div className="flex items-start gap-4 lg:gap-6 flex-1">
              <Image
                src={review.merchant?.logo || '/images/shopee.jpg'}
                alt={review.merchant?.name || 'Merchant'}
                width={80}
                height={80}
                className="w-16 h-16 lg:w-[100px] lg:h-[100px]"
              />
              <div className="flex-1">
                <Link 
                  href={`/merchants/${review.merchant?.slug || review.merchantId}`}
                  className="text-xl lg:text-2xl font-bold text-gray-900 hover:text-blue-600"
                >
                  {review.merchant?.name}
                </Link>
                
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <RatingStars rating={review.merchant?.rating || 0} size={20}/>
                    <span className="font-semibold">{(review.merchant?.rating || 0).toFixed(1)}</span>
                    <div className="hidden sm:flex items-center gap-2 ml-4">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-gray-600">
                        {review.merchant?.reviewCount?.toLocaleString()} reviews
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">👥</span>
                    <span className="text-gray-600">
                      {((review.merchant?.reviewCount || 0) * 100 + 50000).toLocaleString()} visits this week
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sign Up button - Desktop */}
            <div className="hidden lg:flex flex-col gap-2">
              <button className="bg-[#a56b00] outline-none text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">
                Sign Up
              </button>
            </div>
            
            {/* Sign Up button - Mobile */}
            <div className="lg:hidden mt-4">
              <button className="w-full bg-[#a56b00] outline-none text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">
                Sign Up
              </button>
            </div>
          </div>

          {/* Review Title */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{review.title}</h2>
          </div>

          {/* Review Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-medium text-gray-600 font-bold">
                {(review.displayName || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-lg">{review.displayName}</span>
                <span className="text-gray-500">{formatTimeAgo(review.createdAt)}</span>
              </div>
              <RatingStars rating={review.rating} size={24} />
            </div>
          </div>

          {/* Review Content */}
          <div className="prose max-w-none mb-6">
            {review.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-gray-700 mb-4">
                {/* Mobile version with read more */}
                <span className="block lg:hidden">
                  {showFullContent || paragraph.length <= 150 
                    ? paragraph 
                    : `${paragraph.substring(0, 150)}...`
                  }
                </span>
                {/* Desktop version */}
                <span className="hidden lg:block">
                  {paragraph}
                </span>
              </p>
            ))}
            
            {/* Read More button for mobile */}
            <div className="block lg:hidden">
              {review.content.length > 150 && (
                <button
                  onClick={handleReadMore}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showFullContent ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
          </div>

          {/* Review Date */}
          <div className="text-sm text-gray-500 mb-4">
            Reviewed on {formatDate(review.createdAt)}
          </div>

          {/* Reaction Buttons */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <button 
                onClick={() => handleReaction('love')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-all outline-none ${
                  userReactions.love 
                    ? 'bg-[#a96b11] text-white' 
                    : 'hover:bg-[#a96b11] hover:text-white'
                }`}
              >
                <span className="text-lg">❤️</span>
                <span>{reactionCounts.love}</span>
              </button>
              <button 
                onClick={() => handleReaction('cry')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-all outline-none ${
                  userReactions.cry 
                    ? 'bg-[#a96b11] text-white' 
                    : 'hover:bg-[#a96b11] hover:text-white'
                }`}
              >
                <span className="text-lg">😢</span>
                <span>{reactionCounts.cry}</span>
              </button>
              <button 
                onClick={() => handleReaction('angry')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-all outline-none ${
                  userReactions.angry 
                    ? 'bg-[#a96b11] text-white' 
                    : 'hover:bg-[#a96b11] hover:text-white'
                }`}
              >
                <span className="text-lg">😡</span>
                <span>{reactionCounts.angry}</span>
              </button>
              <button 
                onClick={() => setShowCommentForm(!showCommentForm)}
                className="hover:text-blue-600 ml-2 outline-none"
              >
                Reply
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4">
              Comments ({review.comments?.length || 0})
            </h3>
            
            {review.comments && review.comments.length > 0 && (
              <div className="space-y-4">
                {review.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-gray-600 font-bold">
                          {(comment.displayName || 'A').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{comment.displayName}</span>
                          {comment.displayName === 'Store Owner' && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              Merchant
                            </span>
                          )}
                          {comment.selectedReaction && (
                            <div className="flex items-center gap-1">
                              <span className="text-sm">
                                {getReactionEmoji(comment.selectedReaction)}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        {comment.title && (
                          <h5 className="font-medium text-gray-900 mb-1">{comment.title}</h5>
                        )}
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-[#00000080] bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Share this review</h3>
            <div className="mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Report this review</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for reporting:
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a reason</option>
                <option value="spam">Spam</option>
                <option value="fake">Fake review</option>
                <option value="inappropriate">Inappropriate content</option>
                <option value="harassment">Harassment</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Submit Report
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Reply Modal */}
      {showCommentForm && (
        <div className="fixed inset-0 z-50 bg-[#00000080] bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Reply to {review.displayName}&apos;s comment</h3>
              <button
                onClick={() => setShowCommentForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <CommentForm
                reviewId={review.id}
                onSubmit={handleCommentSubmit}
                onCancel={() => setShowCommentForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}