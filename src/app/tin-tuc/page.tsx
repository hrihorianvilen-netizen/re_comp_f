'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RecentlyViewedSwiper, MerchantTabs } from '@/components/merchants';
import { NewsSection } from '@/components/news';
import { RecentReviews } from '@/components/reviews';

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
// Mock data for recently viewed items
const mockRecentlyViewed = [
  {
    id: '1',
    name: 'Shopee',
    image: '/images/shopee.jpg',
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Shopee Express',
    image: '/images/shopee.jpg',
    rating: 4.2,
  },
  {
    id: '3',
    name: 'Shopee Mall',
    image: '/images/shopee.jpg',
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Shopee Food',
    image: '/images/shopee.jpg',
    rating: 4.1,
  },
  {
    id: '5',
    name: 'Shopee Pay',
    image: '/images/shopee.jpg',
    rating: 4.6,
  },
  {
    id: '6',
    name: 'Shopee Games',
    image: '/images/shopee.jpg',
    rating: 4.3,
  },
  {
    id: '7',
    name: 'Shopee Live',
    image: '/images/shopee.jpg',
    rating: 4.4,
  },
  {
    id: '8',
    name: 'Shopee Mart',
    image: '/images/shopee.jpg',
    rating: 4.8,
  },
];

// Mock data for news
const mockNews: NewsItem[] = [
  {
    id: '1',
    slug: 'top-10-ecommerce-platforms-2024',
    title: 'Top 10 E-commerce Platforms to Watch in 2024',
    excerpt: 'Discover the latest trends and emerging platforms that are shaping the future of online retail.',
    content: 'The e-commerce landscape is rapidly evolving with new platforms emerging every day. From innovative marketplaces to specialized niche platforms, businesses have more options than ever before to reach their customers. This comprehensive guide explores the top platforms that are revolutionizing online retail, including their unique features, market positioning, and growth potential. Learn how these platforms are leveraging AI, social commerce, and mobile-first strategies to capture market share and deliver exceptional customer experiences.',
    image: '/images/news/vinuin.png',
    category: 'Newly updated',
    publishedAt: '2024-01-15',
    readTime: '5 min read',
    author: 'Sarah Johnson',
    comments: 42,
    reviews: 128
  },
  {
    id: '2',
    slug: 'consumer-trust-online-reviews-study',
    title: 'Consumer Trust in Online Reviews: A Comprehensive Study',
    excerpt: 'New research reveals how customer reviews influence purchasing decisions and brand reputation.',
    content: 'A groundbreaking study conducted across 10,000 consumers reveals the critical role of online reviews in modern purchasing decisions. The research shows that 93% of consumers read reviews before making a purchase, and authentic, detailed reviews significantly impact conversion rates. This article delves into the psychology behind review trust, the impact of fake reviews, and how businesses can build credibility through transparent review systems.',
    image: '/images/news/vinuin.png',
    category: 'Newly updated',
    publishedAt: '2024-01-12',
    readTime: '8 min read',
    author: 'Michael Chen',
    comments: 38,
    reviews: 95
  },
  {
    id: '3',
    slug: 'ai-customer-service-revolution',
    title: 'The Rise of AI in Customer Service',
    excerpt: 'How artificial intelligence is revolutionizing customer support and improving user experience.',
    content: 'Artificial Intelligence is transforming customer service from reactive to proactive. Companies are now using AI-powered chatbots, sentiment analysis, and predictive analytics to anticipate customer needs and resolve issues before they escalate. This article examines successful AI implementations, ROI metrics, and future trends in AI-driven customer support.',
    image: '/images/news/vinuin.png',
    category: 'Technology',
    publishedAt: '2024-01-10',
    readTime: '6 min read',
    author: 'Emily Davis',
    comments: 56,
    reviews: 201
  },
  {
    id: '4',
    slug: 'sustainable-business-practices-trend',
    title: 'Sustainable Business Practices: A Growing Trend',
    excerpt: 'Companies are adopting eco-friendly approaches to attract environmentally conscious consumers.',
    content: "Sustainability is no longer just a buzzword—it's a business imperative. This article explores how leading companies are integrating sustainable practices into their core operations, from supply chain management to product design. Learn about the financial benefits of going green and how sustainability drives innovation and customer loyalty.",
    image: '/images/news/vinuin.png',
    category: 'Business',
    publishedAt: '2024-01-08',
    readTime: '7 min read',
    author: 'David Wilson',
    comments: 29,
    reviews: 73
  },
  {
    id: '5',
    slug: 'mobile-commerce-future-shopping',
    title: 'Mobile Commerce: The Future of Shopping',
    excerpt: 'Exploring how mobile devices are becoming the primary shopping channel for consumers worldwide.',
    content: 'Mobile commerce has exceeded desktop transactions for the first time, marking a pivotal shift in consumer behavior. This comprehensive analysis covers mobile shopping trends, app vs. web experiences, mobile payment innovations, and strategies for optimizing mobile conversion rates.',
    image: '/images/news/vinuin.png',
    category: 'Technology',
    publishedAt: '2024-01-05',
    readTime: '4 min read',
    author: 'Lisa Rodriguez',
    comments: 31,
    reviews: 89
  }
];

// Mock data for merchants
const mockMerchants = [
  {
    id: '1',
    slug: 'techstore-pro',
    name: 'TechStore Pro',
    description: 'Leading technology retailer with excellent customer service.',
    category: 'Technology',
    rating: 4.5,
    reviewCount: 1250,
    status: 'recommended' as const,
    logo: '/images/shopee.jpg',
    allowComments: true,
    hideAds: false,
    isStarred: true,
    reportCount: 0,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
  },
  {
    id: '2',
    slug: 'fashion-hub',
    name: 'Fashion Hub',
    description: 'Trendy fashion store with latest styles.',
    category: 'Fashion',
    rating: 4.2,
    reviewCount: 890,
    status: 'trusted' as const,
    logo: '/images/shopee.jpg',
    allowComments: true,
    hideAds: false,
    isStarred: false,
    reportCount: 1,
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-22T00:00:00.000Z',
  },
  {
    id: '3',
    slug: 'quickfood-delivery',
    name: 'QuickFood Delivery',
    description: 'Food delivery service with mixed reviews.',
    category: 'Food & Dining',
    rating: 3.2,
    reviewCount: 650,
    status: 'controversial' as const,
    logo: '/images/shopee.jpg',
    allowComments: true,
    hideAds: true,
    isStarred: false,
    reportCount: 15,
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-25T00:00:00.000Z',
  },
];

// Mock data for reviews
const mockReviews = [
  {
    id: '1',
    merchantId: '1',
    merchantName: 'TechStore Pro',
    userId: 'user1',
    userName: 'John Doe',
    rating: 5,
    title: 'Excellent Service!',
    content: 'Best online shopping experience I have had.',
    helpful: 45,
    notHelpful: 2,
    verified: true,
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
  },
  {
    id: '2',
    merchantId: '2',
    merchantName: 'Fashion Hub',
    userId: 'user2',
    userName: 'Jane Smith',
    rating: 4,
    title: 'Great quality clothes',
    content: 'The clothes are of great quality and shipping was fast.',
    helpful: 32,
    notHelpful: 5,
    verified: true,
    createdAt: '2024-01-19T00:00:00.000Z',
    updatedAt: '2024-01-19T00:00:00.000Z',
  },
  {
    id: '3',
    merchantId: '3',
    merchantName: 'QuickFood Delivery',
    userId: 'user3',
    userName: 'Mike Johnson',
    rating: 2,
    title: 'Disappointed with service',
    content: 'Food arrived cold and late. Not satisfied.',
    helpful: 18,
    notHelpful: 3,
    verified: false,
    createdAt: '2024-01-18T00:00:00.000Z',
    updatedAt: '2024-01-18T00:00:00.000Z',
  },
];

export default function TinTucPage() {
  const [activeTab, setActiveTab] = useState<'brands' | 'reviews' | 'news'>('news');
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Image with Text Overlay */}
      <div className="w-full relative">
        <Image
          src="/images/banner.png"
          alt="Review Banner"
          width={1440}
          height={300}
          className="w-full md:h-full h-[120px] md:object-cover"
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
                  className="block w-full pl-10 pr-3 py-1.5 border-2 border-gray-300 rounded-full placeholder-gray-500 text-gray-900 bg-white focus:outline-none text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <RecentlyViewedSwiper items={mockRecentlyViewed} />
      
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
            <MerchantTabs merchants={mockMerchants} />
          )}
          
          {activeTab === 'reviews' && (
            <RecentReviews reviews={mockReviews} />
          )}
          
          {activeTab === 'news' && (
            <NewsSection 
              news={mockNews}
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
          news={mockNews}
          showCategories={true}
          showPagination={true}
          itemsPerPage={16}
        />
      </div>
    </div>
  );
}