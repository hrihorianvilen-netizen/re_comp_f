'use client';

import { useState, useEffect } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { RecentlyViewedSwiper, MerchantTabs } from '@/components/merchants';
import { NewsSection } from '@/components/news';
import { RecentReviews } from '@/components/reviews';
import api from '@/lib/api';
import { Merchant, Review } from '@/types/api';

interface NewsItem {
  id: string;
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  publishedAt: string;
  readTime: string;
  author: string;
  comments: number;
  reviews: number;
}

export default function TinTucPage() {
  const [activeTab, setActiveTab] = useState<'brands' | 'reviews' | 'news'>('news');
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recentMerchants, setRecentMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  // Load all data from backend
  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('Loading data from backend...');

      // Execute all API calls in parallel
      const [newsResult, merchantResult, reviewResult, recentMerchantResult] = await Promise.all([
        api.getPosts({ limit: 50 }), // Fetch posts/news
        api.getMerchants({ limit: 20 }),
        api.getReviews({ limit: 10 }),
        api.getMerchants({ limit: 10 }) // For recently viewed
      ]);

      console.log('API Results:', { newsResult, merchantResult, reviewResult });

      // Process news/posts data
      if (newsResult.data && newsResult.data.posts) {
        console.log('Processing posts:', newsResult.data.posts);
        const formattedNews: NewsItem[] = newsResult.data.posts.map((post: {
          id: string;
          slug?: string;
          title?: string;
          content?: string;
          image?: string;
          featuredImage?: string;
          category?: string;
          publishedAt?: string;
          createdAt?: string;
          readTime?: string;
          author?: string;
          comments?: number;
          reviews?: number;
          likes?: number;
        }) => ({
          id: post.id,
          slug: post.slug || post.id,
          title: post.title || 'Untitled',
          excerpt: post.content ? post.content.substring(0, 150) + '...' : '',
          content: post.content || '',
          image: post.image || post.featuredImage || '/images/news/vinuin.png',
          category: post.category || 'Uncategorized',
          publishedAt: post.publishedAt || post.createdAt || new Date().toISOString(),
          readTime: post.readTime || '5 min read',
          author: post.author || 'Admin',
          comments: post.comments || 0,
          reviews: post.reviews || post.likes || 0
        }));
        console.log('Formatted news:', formattedNews);
        setNewsData(formattedNews);
        setFilteredNews(formattedNews);
      } else {
        console.log('No posts data found in response');
      }

      // Process merchants
      if (merchantResult.data) {
        const publicMerchants = merchantResult.data.merchants.filter(
          merchant => merchant.status !== 'draft'
        );
        setMerchants(publicMerchants);
      }

      // Process reviews
      if (reviewResult.data) {
        setReviews(reviewResult.data.reviews);
      }

      // Process recent merchants for swiper
      if (recentMerchantResult.data) {
        const publicRecentMerchants = recentMerchantResult.data.merchants.filter(
          merchant => merchant.status !== 'draft'
        );
        setRecentMerchants(publicRecentMerchants);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Don't fall back to mock data - show empty state instead
      setNewsData([]);
      setFilteredNews([]);
      setMerchants([]);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === '') {
      setFilteredNews(newsData);
    } else {
      const filtered = newsData.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          item.content.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.author.toLowerCase().includes(query)
      );
      setFilteredNews(filtered);
    }
  };

  // Transform recent merchants for swiper
  const recentlyViewedItems = recentMerchants.slice(0, 10).map((item, index) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    image: item.logo || '/images/shopee.jpg',
    rating: item.rating || 0,
    uniqueKey: `${item.id}-${index}`
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#198639]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Image with Text Overlay */}
      <div className="w-full relative">
        <OptimizedImage
          src="/images/banner.png"
          alt="Review Banner"
          width={1440}
          height={300}
          className="w-full md:h-full h-[120px] md:object-cover"
          sizeType="full"
          qualityPriority="high"
          priority
        />
        {/* Text Overlay */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute inset-0 flex items-center md:justify-start justify-center">
          <div className="text-center text-black space-y-2 ">
            <h1 className="text-xl md:text-2xl font-medium">
              Trusted Company Reviews 2025
            </h1>
            <p className="text-md md:text-xl font-medium">
              Smart people read first and buy later.
            </p>
            
            {/* Search Field */}
            <div className="max-w-4xl mx-auto mt-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search news articles..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="block w-full pl-10 pr-3 py-1.5 border-2 border-gray-300 rounded-full placeholder-gray-500 text-gray-900 bg-white focus:outline-none text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <RecentlyViewedSwiper items={recentlyViewedItems} />
      
      {/* Mobile Tab Bar */}
      <div className="md:hidden max-w-7xl mx-auto px-4 mt-6">
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('brands')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'brands'
                ? 'text-[#198639] border-b-2 border-[#198639]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Brands
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'text-[#198639] border-b-2 border-[#198639]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recent Reviews
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'news'
                ? 'text-[#198639] border-b-2 border-[#198639]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            News
          </button>
        </div>
        
        {/* Mobile Tab Content */}
        <div className="w-full">
          {activeTab === 'brands' && (
            <MerchantTabs merchants={merchants} />
          )}

          {activeTab === 'reviews' && (
            <RecentReviews reviews={reviews} />
          )}

          {activeTab === 'news' && (
            <NewsSection
              news={filteredNews}
              showCategories={true}
              showPagination={false}
              showSidebar={true}
              itemsPerPage={5}
            />
          )}
        </div>
      </div>
      
      {/* Desktop Content */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewsSection
          news={filteredNews}
          showCategories={true}
          showPagination={true}
          itemsPerPage={16}
        />
      </div>
    </div>
  );
}