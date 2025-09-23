'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { Merchant, Review, FAQ } from '@/types/api';
import { RatingStars, InteractiveRatingStars } from '@/components/ui';
import { ReviewFormModal, ReviewFormData } from '@/components/reviews';
import { AddCommentButton, CommentsView } from '@/components/comments';
import { GiftCodeSection } from '@/components/merchants';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import AdSlot from '@/components/ui/AdSlot';
import { useUpdateRecentlyViewed, useCreateReview } from '@/hooks/useMerchants';
import toast from 'react-hot-toast';
import 'swiper/css';
import 'swiper/css/navigation';

export default function MerchantDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  // State for real data
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  const reviewsPerPage = 5;
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [selectedRatingFilters, setSelectedRatingFilters] = useState<Set<number>>(new Set());

  // Use React Query mutations
  const updateRecentlyViewed = useUpdateRecentlyViewed();
  const createReviewMutation = useCreateReview();

  // Function to refresh reviews list
  const refreshReviews = async () => {
    if (!merchant?.slug) return;
    try {
      const reviewsRes = await api.getReviews({ merchantSlug: merchant.slug, limit: 50 });
      if (reviewsRes.data) {
        setReviews(reviewsRes.data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to refresh reviews:', error);
    }
  };

  // Function to refresh merchant data (including updated rating)
  const refreshMerchantData = async () => {
    if (!slug) return;
    try {
      const merchantRes = await api.getMerchant(slug);
      if (merchantRes.data) {
        const merchantData = merchantRes.data.merchant || merchantRes.data;
        setMerchant(merchantData);
      }
    } catch (error) {
      console.error('Failed to refresh merchant data:', error);
    }
  };

  // Load merchant and reviews from backend
  useEffect(() => {
    const loadMerchantData = async () => {
      if (!slug) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Optimized: Load merchant, reviews, and track visit in parallel
        const [merchantRes, reviewsRes] = await Promise.all([
          api.getMerchant(slug),
          api.getReviews({ merchantSlug: slug, limit: 50 }),
          api.trackMerchantVisit(slug).catch(err => {
            console.warn('Failed to track merchant visit:', err);
            return null; // Don't fail the whole operation if tracking fails
          })
        ]);

        if (merchantRes.error) {
          setError(merchantRes.error);
        } else if (merchantRes.data) {
          const merchantData = merchantRes.data.merchant || merchantRes.data;
          setMerchant(merchantData);

          // Save to recently viewed using React Query mutation
          updateRecentlyViewed.mutate(merchantData);
        }

        if (reviewsRes.data) {
          setReviews(reviewsRes.data.reviews || []);
        }
      } catch (err) {
        console.error('Failed to load merchant data:', err);
        setError('Failed to load merchant information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadMerchantData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Removed saveToRecentlyViewed function - now using React Query mutation

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };
  
  const formatTimeAgo = (date: string | Date) => {
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

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };


  const toggleRatingFilter = (rating: number) => {
    setSelectedRatingFilters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rating)) {
        newSet.delete(rating);
      } else {
        newSet.add(rating);
      }
      return newSet;
    });
    // Reset to first page when filter changes
    setCurrentReviewPage(1);
  };

  // Calculate emoticon counts from comments
  const getEmoticonCounts = (review: Review) => {
    const counts = { love: 0, cry: 0, angry: 0 };
    
    if (review.comments) {
      review.comments.forEach(comment => {
        // Backend stores reactions as actual emoji strings
        if (comment.reaction === '❤️') counts.love++;
        else if (comment.reaction === '😢') counts.cry++;
        else if (comment.reaction === '😡') counts.angry++;
      });
    }
    
    return counts;
  };

  // Connect review submission to backend using React Query
  const handleReviewSubmit = async (data: ReviewFormData) => {
    if (!merchant) return;

    const loadingToast = toast.loading('Submitting your review...');

    try {
      await createReviewMutation.mutateAsync({
        merchantId: merchant.id,
        merchantSlug: merchant.slug,
        title: data.title,
        rating: data.rating,
        content: data.content,
        displayName: data.displayName,
        captchaToken: data.captchaToken
      });

      toast.dismiss(loadingToast);
      toast.success('Review submitted successfully!', {
        icon: '✅',
      });
      setReviewModalOpen(false);

      // Refresh both merchant data (for updated rating) and reviews list
      await Promise.all([
        refreshMerchantData(),
        refreshReviews()
      ]);
      setCurrentReviewPage(1);
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Review submission error:', error);

      // Extract meaningful error message
      let errorMessage = 'Failed to submit review. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('already reviewed')) {
          errorMessage = 'You have already reviewed this merchant.';
        } else if (error.message.includes('meaningful content')) {
          errorMessage = 'Please provide more meaningful content for your review.';
        } else if (error.message.includes('Captcha')) {
          errorMessage = 'Captcha verification failed. Please try again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage, {
        icon: '❌',
        duration: 5000,
      });
    }
  };


  const handleReportReview = async (reviewId: string) => {
    try {
      const confirmed = window.confirm('Are you sure you want to report this review? This action will be reviewed by our moderation team.');

      if (!confirmed) return;

      const loadingToast = toast.loading('Reporting review...');
      const response = await api.reportReview(reviewId);
      toast.dismiss(loadingToast);

      if (response.data?.message) {
        toast.success('Review reported successfully. Thank you for helping us maintain quality reviews.', {
          icon: '🛡️',
          duration: 4000,
        });
      } else if (response.error) {
        toast.error(response.error, {
          icon: '⚠️',
        });
      } else {
        toast.error('Failed to report review. Please try again.', {
          icon: '❌',
        });
      }
    } catch (error) {
      console.error('Failed to report review:', error);
      toast.error('Failed to report review. Please try again.', {
        icon: '❌',
      });
    }
  };

  // Loading state
  if (loading) {
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
  if (error || !merchant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Merchant Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The merchant you are looking for does not exist.'}</p>
          <Link href="/merchants" className="text-[#198639] hover:underline">
            Browse all merchants →
          </Link>
        </div>
      </div>
    );
  }

  // Parse JSON fields if they're strings and ensure it's an array
  let screenshots: string[] = [];
  try {
    if (Array.isArray(merchant.screenshots)) {
      screenshots = merchant.screenshots;
    } else if (typeof merchant.screenshots === 'string') {
      screenshots = JSON.parse(merchant.screenshots);
    }
    // Ensure all entries are strings and filter out empty ones
    screenshots = screenshots.filter(url => url && typeof url === 'string');
  } catch (error) {
    console.error('Failed to parse screenshots:', error);
    screenshots = [];
  }
  
  const faqItems = typeof merchant.faq === 'string'
    ? JSON.parse(merchant.faq)
    : merchant.faq || [];


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
            <span className="text-gray-900">{merchant.name}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6">
            <div className="flex items-start gap-4 lg:gap-6 flex-1">
              <OptimizedImage
                src={getImageUrl(merchant.logo, '/images/shopee.jpg')}
                alt={merchant.name}
                width={100}
                height={100}
                className="w-16 h-16 lg:w-[100px] lg:h-[100px]"
                sizeType="thumbnail"
                qualityPriority="high"
                priority
              />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl lg:text-3xl font-bold text-gray-900">{merchant.name}</h1>
                </div>
                
                <div className="flex flex-col gap-2 lg:gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <RatingStars rating={merchant.rating || 0} size={20}/>
                    <span className="font-semibold lg:text-lg">{(merchant.rating || 0).toFixed(1)}</span>
                    <div className="hidden sm:flex items-center gap-2 ml-4">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm lg:text-base text-gray-600">
                        {(merchant.reviewCount || 0).toLocaleString()} reviews
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm lg:text-base">
                    <span className="text-blue-500">👥</span>
                    <span className="text-gray-600">
                      {((merchant.weeklyVisits || 0)).toLocaleString()} visits this week
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sign Up button - Desktop only */}
            <div className="hidden lg:flex flex-col gap-2">
              {merchant.website && (
                <a 
                  href={merchant.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#a56b00] outline-none text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                  Visit Website
                </a>
              )}
            </div>
          </div>
          
          {/* Screenshots Carousel */}
          {screenshots.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Screenshots</h3>
              <Swiper
                modules={[Autoplay, Navigation]}
                spaceBetween={16}
                slidesPerView={5}
                loop={screenshots.length > 1}
                autoplay={screenshots.length > 1 ? {
                  delay: 4000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                } : false}
                navigation={screenshots.length > 1}
                breakpoints={{
                  320: {
                    slidesPerView: Math.min(2, screenshots.length),
                  },
                  640: {
                    slidesPerView: Math.min(3, screenshots.length),
                  },
                  768: {
                    slidesPerView: Math.min(4, screenshots.length),
                  },
                  1024: {
                    slidesPerView: Math.min(5, screenshots.length),
                  },
                }}
                className="merchant-screenshots"
              >
                {screenshots.map((screenshot: string, index: number) => (
                  <SwiperSlide key={index}>
                    <div
                      className="cursor-pointer group relative overflow-hidden rounded-lg"
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setModalOpen(true);
                      }}
                    >
                      <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                        <OptimizedImage
                          src={getImageUrl(screenshot, '/images/shopee.jpg')}
                          alt={`${merchant.name} screenshot ${index + 1}`}
                          width={400}
                          height={300}
                          className="absolute inset-0 rounded-lg border w-full h-full object-contain bg-white hover:opacity-90 transition-all duration-300 group-hover:scale-105"
                          sizeType="card"
                          qualityPriority="medium"
                          priority={index < 3}
                        />
                      </div>
                      {/* Overlay for better user experience */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {/* No Screenshots Message */}
          {screenshots.length === 0 && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h4 className="text-lg font-medium text-gray-600 mb-1">No Screenshots Available</h4>
              <p className="text-gray-500">Screenshots for {merchant.name} will be displayed here when available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Merchant Description Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              About {merchant.name}
            </h2>
            <div className="text-gray-700 leading-relaxed">
              <div className="relative overflow-hidden">
                <div
                  className={`prose prose-sm max-w-none text-gray-600 transition-all duration-500 ease-in-out ${
                    isDescriptionExpanded
                      ? 'opacity-100 transform translate-y-0'
                      : 'opacity-100'
                  }`}
                  style={{
                    maxHeight: isDescriptionExpanded ? 'none' : '4.5em',
                    overflow: 'hidden',
                  }}
                  dangerouslySetInnerHTML={{ __html: merchant.description }}
                />
                {!isDescriptionExpanded && merchant.description && merchant.description.length > 300 && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                )}
              </div>
              {merchant.description && merchant.description.length > 300 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-3 text-[#198639] hover:text-[#145a2c] font-medium text-sm transition-all duration-300 inline-flex items-center gap-1 hover:gap-2 group cursor-pointer"
                >
                  {isDescriptionExpanded ? (
                    <>
                      Show Less
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Read More
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Inline Ad After Description - Only show if merchant allows ads */}
      {!merchant.hideAds && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AdSlot slot="inline" merchantId={merchant.id} />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gift Code Section */}
            <GiftCodeSection
              merchantSlug={slug}
              merchantId={merchant.id}
              merchantName={merchant.name}
            />

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="space-y-6">
                  <div className="flex justify-between md:flex-row flex-col items-center text-center border-b pb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Review your experience on {merchant.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">Your review is very helpful to many others.</p>
                    </div>
                    <div>
                      <InteractiveRatingStars 
                        size={30}
                        onRatingChange={() => setReviewModalOpen(true)}
                      />
                    </div>
                  </div>
                  
                  {/* Review product name section */}
                  <div className="py-4 border-b">
                    <h4 className="font-semibold text-lg mb-3">Review {merchant.name}</h4>
                    
                    {/* Review count and sort */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {selectedRatingFilters.size > 0 
                          ? `${reviews.filter(review => selectedRatingFilters.has(review.rating)).length} of ${reviews.length} reviews`
                          : `${reviews.length} reviews`
                        }
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <select className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#198639]">
                          <option value="newest">Newest</option>
                          <option value="oldest">Oldest</option>
                          <option value="highest">Highest Rating</option>
                          <option value="lowest">Lowest Rating</option>
                          <option value="helpful">Most Helpful</option>
                        </select>
                      </div>
                    </div>
                  </div>
                    
                    <div className="space-y-6 overflow-hidden">
                      {(() => {
                        // Apply rating filter
                        const filteredReviews = selectedRatingFilters.size > 0 
                          ? reviews.filter(review => selectedRatingFilters.has(review.rating))
                          : reviews;
                        
                        const startIndex = (currentReviewPage - 1) * reviewsPerPage;
                        const endIndex = startIndex + reviewsPerPage;
                        const currentReviews = filteredReviews.slice(startIndex, endIndex);
                        
                        if (currentReviews.length === 0) {
                          return (
                            <div className="text-center py-8">
                              <p className="text-gray-500">No reviews yet. Be the first to write one!</p>
                            </div>
                          );
                        }
                        
                        return currentReviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0 group overflow-hidden">
                          {/* Review header with avatar, name, time, and rating */}
                          <div className="flex items-start gap-3 mb-3 min-w-0">
                            {/* Avatar */}
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-medium text-gray-600 font-bold">
                                {(review.displayName || 'A').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            
                            {/* Name, time and rating */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1 min-w-0">
                                <span className="font-medium text-gray-900 break-words flex-1">{review.displayName || 'Anonymous'}</span>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className="text-sm text-gray-500">{formatTimeAgo(review.createdAt)}</span>
                                  {/* Report button with hover effect */}
                                  <div className="relative group">
                                    <button
                                      onClick={() => handleReportReview(review.id)}
                                      className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 cursor-pointer"
                                      title="Report this review"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.081 16.5c-.77.833.19 2.5 1.732 2.5z" />
                                      </svg>
                                    </button>
                                    {/* Hover tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                      <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.081 16.5c-.77.833.19 2.5 1.732 2.5z" />
                                      </svg>
                                      Report
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <RatingStars rating={review.rating} size={20} />
                            </div>
                          </div>
                          
                          <div className="ml-4 sm:ml-[52px] mb-4 overflow-hidden">
                            <div className="prose prose-sm max-w-none text-gray-700 break-words overflow-wrap-anywhere leading-relaxed">
                              {/* Mobile: shorter limit (100 chars), Desktop: longer limit (200 chars) */}
                              {review.content && (
                                <>
                                  {/* Mobile version */}
                                  <div
                                    className="block sm:hidden"
                                    dangerouslySetInnerHTML={{
                                      __html: review.content.length > 100 && !expandedReviews.has(review.id)
                                        ? `${review.content.substring(0, 100)}...`
                                        : review.content
                                    }}
                                  />
                                  {/* Desktop version */}
                                  <div
                                    className="hidden sm:block"
                                    dangerouslySetInnerHTML={{
                                      __html: review.content.length > 200 && !expandedReviews.has(review.id)
                                        ? `${review.content.substring(0, 200)}...`
                                        : review.content
                                    }}
                                  />
                                </>
                              )}
                            </div>
                            {review.content && (
                              <>
                                {/* Mobile show more/less button */}
                                {review.content.length > 100 && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toggleReviewExpansion(review.id);
                                    }}
                                    className="sm:hidden text-blue-600 hover:text-blue-800 text-sm font-medium mt-1 outline-none cursor-pointer"
                                  >
                                    {expandedReviews.has(review.id) ? 'Show less' : 'Show more'}
                                  </button>
                                )}
                                {/* Desktop show more/less button */}
                                {review.content.length > 200 && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toggleReviewExpansion(review.id);
                                    }}
                                    className="hidden sm:block text-blue-600 hover:text-blue-800 text-sm font-medium mt-1 outline-none cursor-pointer"
                                  >
                                    {expandedReviews.has(review.id) ? 'Show less' : 'Show more'}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 ml-4 sm:ml-[52px]">
                            {(() => {
                              const emoticonCounts = getEmoticonCounts(review);
                              
                              return (
                                <>
                                  <button 
                                    onClick={() => api.markReviewHelpful(review.id)}
                                    className="flex items-center gap-1 hover:bg-[#a96b11] hover:text-white px-2 py-1 rounded transition-all outline-none cursor-pointer"
                                  >
                                    <span className="text-lg">❤️</span>
                                    <span>{emoticonCounts.love}</span>
                                  </button>
                                  <button 
                                    onClick={() => api.markReviewNotHelpful(review.id)}
                                    className="flex items-center gap-1 hover:bg-[#a96b11] hover:text-white px-2 py-1 rounded transition-all outline-none cursor-pointer"
                                  >
                                    <span className="text-lg">😢</span>
                                    <span>{emoticonCounts.cry}</span>
                                  </button>
                                  <button className="flex items-center gap-1 hover:bg-[#a96b11] hover:text-white px-2 py-1 rounded transition-all outline-none cursor-pointer">
                                    <span className="text-lg">😡</span>
                                    <span>{emoticonCounts.angry}</span>
                                  </button>
                                  {/* Add Comment Button next to reactions */}
                                  <AddCommentButton
                                    reviewId={review.id}
                                    merchantSlug={merchant.slug}
                                    onCommentAdded={refreshReviews}
                                  />
                                </>
                              );
                            })()}
                          </div>
                          
                          {/* Comments Section */}
                          <div className="ml-4 sm:ml-[52px]">
                            <CommentsView
                              reviewId={review.id}
                              initialComments={review.comments || []}
                            />
                          </div>
                          
                        </div>
                      ));
                      })()}
                    </div>
                    
                    {/* Pagination for Reviews */}
                    {(() => {
                      const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);
                      if (totalReviewPages <= 1) return null;
                      
                      return (
                        <div className="flex justify-center items-center gap-2 mt-6">
                          <button
                            onClick={() => setCurrentReviewPage(prev => Math.max(1, prev - 1))}
                            disabled={currentReviewPage === 1}
                            className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 hover:cursor-pointer"
                          >
                            &lt;
                          </button>
                          
                          <div className="flex gap-1">
                            {[...Array(totalReviewPages)].map((_, index) => (
                              <button
                                key={index + 1}
                                onClick={() => setCurrentReviewPage(index + 1)}
                                className={`px-3 py-1 rounded-md border ${
                                  currentReviewPage === index + 1
                                    ? 'bg-[#198639] text-white border-[#198639]'
                                    : 'border-gray-300 hover:bg-gray-100'
                                }`}
                              >
                                {index + 1}
                              </button>
                            ))}
                          </div>
                          
                          <button
                            onClick={() => setCurrentReviewPage(prev => Math.min(totalReviewPages, prev + 1))}
                            disabled={currentReviewPage === totalReviewPages}
                            className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 hover:cursor-pointer"
                          >
                            &gt;
                          </button>
                        </div>
                      );
                    })()}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ratings and Comments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Ratings and comments</h3>
              
              {/* Rating Summary */}
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl font-semibold">
                  {(merchant.rating || 0).toFixed(1)} / 5
                </div>
                <RatingStars rating={merchant.rating || 0} size={24} />
                <div className="text-sm text-gray-600 underline cursor-pointer">
                  {merchant.reviewCount || 0} reviews
                </div>
              </div>
              
              {/* Rating Breakdown */}
              <div className="space-y-2">
                {(() => {
                  // Calculate distribution based on actual reviews
                  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                  reviews.forEach(review => {
                    const rating = Math.round(review.rating);
                    if (rating >= 1 && rating <= 5) {
                      distribution[rating as keyof typeof distribution]++;
                    }
                  });
                  
                  const total = reviews.length || 1; // Avoid division by zero
                  
                  return [5, 4, 3, 2, 1].map((stars) => {
                    const count = distribution[stars as keyof typeof distribution];
                    const percentage = Math.floor((count / total) * 100);
                    
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={selectedRatingFilters.has(stars)}
                          onChange={() => toggleRatingFilter(stars)}
                          className="w-4 h-4 rounded border-gray-300 text-[#198639] focus:ring-[#198639]"
                        />
                        <div className="flex items-center gap-1 w-12">
                          <span className="text-sm">{stars}</span>
                          <span className="text-gray-600">star</span>
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-yellow-400 h-full rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
              
              {/* Clear Filters */}
              {selectedRatingFilters.size > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => {
                      setSelectedRatingFilters(new Set());
                      setCurrentReviewPage(1);
                    }}
                    className="text-sm text-[#198639] hover:text-[#15732f] underline"
                  >
                    Clear rating filters
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar Ad - Only show if merchant allows ads */}
            {!merchant.hideAds && (
              <AdSlot slot="sidebar" merchantId={merchant.id} />
            )}

          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      {faqItems.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {faqItems.map((item: FAQ, index: number) => (
                    <div key={item.id || index} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <button
                        className="w-full text-left flex justify-between items-start gap-4 outline-none cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setExpandedFAQ(expandedFAQ === (item.id || index.toString()) ? null : (item.id || index.toString()))}
                      >
                        <h3 className="font-medium text-[#007aff]">{item.question}</h3>
                        <svg
                          className={`w-5 h-5 flex-shrink-0 text-[#007aff] transition-transform ${
                            expandedFAQ === (item.id || index.toString()) ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {expandedFAQ === (item.id || index.toString()) && (
                        <div
                          className="mt-3 text-gray-600 text-sm prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.answer }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {modalOpen && screenshots.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-[#00000080] bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <Swiper
              modules={[Navigation]}
              spaceBetween={10}
              slidesPerView={1}
              navigation={screenshots.length > 1}
              initialSlide={selectedImageIndex}
              className="modal-swiper"
              keyboard={{
                enabled: true,
                onlyInViewport: true,
              }}
            >
              {screenshots.map((screenshot: string, index: number) => (
                <SwiperSlide key={index}>
                  <div className="flex items-center justify-center h-[70vh] relative">
                    <OptimizedImage
                      src={getImageUrl(screenshot, '/images/shopee.jpg')}
                      alt={`${merchant.name} screenshot ${index + 1}`}
                      width={800}
                      height={600}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      sizeType="card"
                      qualityPriority="medium"
                    />
                    {/* Image counter */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                      {index + 1} / {screenshots.length}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      <ReviewFormModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        merchantName={merchant.name}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}