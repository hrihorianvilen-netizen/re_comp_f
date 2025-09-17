'use client';

import { useState } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';

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

interface NewsSectionProps {
  news?: NewsItem[];
  showCategories?: boolean;
  showPagination?: boolean;
  showSidebar?: boolean;
  itemsPerPage?: number;
}

// Default mock data for news
const defaultMockNews: NewsItem[] = [
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

const categories = [
  'All',
  'Newly updated',
  'Technology',
  'Business',
  'Reviews',
  'E-commerce'
];

export default function NewsSection({
  news = defaultMockNews,
  showCategories = true,
  showPagination = true,
  showSidebar = true,
  itemsPerPage = 16
}: NewsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredNews = selectedCategory === 'All'
    ? news
    : news.filter(item => item.category === selectedCategory);

  // Calculate pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNews = filteredNews.slice(startIndex, endIndex);


  // Reset page when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of news section
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  return (
    <div className={showSidebar ? "grid grid-cols-1 lg:grid-cols-3 gap-8" : ""}>
      {/* Main News Section - 2/3 width or full width */}
      <div className={showSidebar ? "lg:col-span-2 bg-white" : "bg-white"}>
      {/* Category Tabs */}
      {showCategories && (
        <div className="p-4">
          <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === category
                    ? 'bg-[#a56b0075] text-white border-1 border-[#198639]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* News Articles */}
      <div className="space-y-6 p-4">
        {currentNews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No articles available</p>
          </div>
        ) : (
          currentNews.map((article) => (
            <article key={article.id} className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <OptimizedImage
                    src={article.image}
                    alt={article.title}
                    width={268}
                    height={151}
                    className="w-full h-48 md:h-full object-cover"
                    sizeType="card"
                    qualityPriority="medium"
                  />
                </div>
                <div className="md:w-2/3 p-4">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-[#198639] transition-colors">
                    <Link href={`/tin-tuc/p-${article.slug || article.id}`}>
                      {article.title}
                    </Link>
                  </h3>

                  {/* Comments and Reviews */}
                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{article.comments} Comments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span>{article.reviews} Reviews</span>
                    </div>
                  </div>

                  {/* Content with truncation */}
                  <p className="text-gray-600 mb-3 text-sm line-clamp-3">
                    {article.content}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4 border-t">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            &lt;
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page
                    ? 'bg-[#198639] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            &gt;
          </button>
        </div>
      )}
      </div>

      {/* Sidebar - Read More Section - 1/3 width */}
      {showSidebar && (
      <div className="lg:col-span-1">
        <div className="sticky top-4 space-y-6">
          {/* Read more */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Read more</h3>
            <div className="space-y-4">
              {news.slice(0, 4).map((article) => (
                <div key={`popular-${article.id}`} className="flex gap-3 border-b-2 border-gray-200 pb-3 last:border-0 last:pb-0">
                  <div className="flex-shrink-0">
                    <OptimizedImage
                      src={article.image}
                      alt={article.title}
                      width={80}
                      height={60}
                      className="object-cover"
                      sizeType="thumbnail"
                      qualityPriority="medium"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-[#198639] transition-colors mb-1">
                      <Link href={`/tin-tuc/p-${article.slug || article.id}`}>
                        {article.title}
                      </Link>
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{article.comments} comments</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        <span>{article.reviews} reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Get bonuses section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Don&apos;t miss your chance to get free giftcode</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Get bonuses, giftcodes and attractive gifts.
              </p>
              
              {/* Email and Register */}
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#a56b00]"
                />
                <button className="px-4 py-2 bg-[#a56b00] text-white rounded-md hover:opacity-90 transition-opacity font-medium text-sm">
                  Register
                </button>
              </div>
              
              {/* Or divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[1px] bg-gray-300"></div>
                <span className="text-xs text-gray-500">or</span>
                <div className="flex-1 h-[1px] bg-gray-300"></div>
              </div>
              
              {/* Social Login Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button className="flex items-center justify-center gap-1 py-2 px-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-xs">Google</span>
                </button>
                
                <button className="flex items-center justify-center gap-1 py-2 px-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-xs">Facebook</span>
                </button>
                
                <button className="flex items-center justify-center gap-1 py-2 px-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="text-xs">Apple</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}