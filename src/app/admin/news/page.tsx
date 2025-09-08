'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: string;
  status: 'published' | 'draft' | 'scheduled';
  author: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  likes: number;
}

// Mock data for admin news management
const mockNews: NewsArticle[] = [
  {
    id: '1',
    title: 'Top 10 E-commerce Platforms to Watch in 2024',
    excerpt: 'The e-commerce landscape is rapidly evolving with new platforms emerging every day.',
    content: 'Full article content here...',
    image: '/images/news/vinuin.png',
    category: 'E-commerce',
    status: 'published',
    author: 'Admin',
    publishedAt: new Date('2024-01-20'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-20'),
    views: 1250,
    likes: 89,
  },
  {
    id: '2',
    title: 'Understanding Customer Reviews Impact on Business',
    excerpt: 'How customer feedback shapes modern business strategies and consumer trust.',
    content: 'Full article content here...',
    image: '/images/news/vinuin.png',
    category: 'Business',
    status: 'published',
    author: 'Admin',
    publishedAt: new Date('2024-01-18'),
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-18'),
    views: 890,
    likes: 67,
  },
  {
    id: '3',
    title: 'The Future of Online Shopping Experience',
    excerpt: 'Exploring trends in digital commerce and user experience design.',
    content: 'Full article content here...',
    image: '/images/news/vinuin.png',
    category: 'Technology',
    status: 'draft',
    author: 'Admin',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
    views: 0,
    likes: 0,
  },
  {
    id: '4',
    title: 'Best Practices for Merchant Verification',
    excerpt: 'Guidelines for ensuring merchant authenticity and customer safety.',
    content: 'Full article content here...',
    image: '/images/news/vinuin.png',
    category: 'Security',
    status: 'scheduled',
    author: 'Admin',
    publishedAt: new Date('2024-01-30'),
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-24'),
    views: 0,
    likes: 0,
  },
];

const statusColors = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
};

const categories = ['All', 'E-commerce', 'Business', 'Technology', 'Security', 'Reviews'];

export default function AdminNewsPage() {
  const [news] = useState(mockNews);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNews, setSelectedNews] = useState<string[]>([]);

  const filteredNews = news.filter(article => {
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || article.status === selectedStatus;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleSelectAll = () => {
    if (selectedNews.length === filteredNews.length) {
      setSelectedNews([]);
    } else {
      setSelectedNews(filteredNews.map(n => n.id));
    }
  };

  const handleSelectNews = (newsId: string) => {
    if (selectedNews.includes(newsId)) {
      setSelectedNews(selectedNews.filter(id => id !== newsId));
    } else {
      setSelectedNews([...selectedNews, newsId]);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">News Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Create and manage news articles for your platform
                </p>
              </div>
              <Link
                href="/admin/news/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#198639] hover:bg-[#145a2c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#198639]"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Article
              </Link>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
                  />
                </div>
                <div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-[#198639] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNews.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {selectedNews.length} article(s) selected
                  </span>
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                      Publish
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                      Draft
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* News Cards Grid */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Articles ({filteredNews.length})</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedNews.length === filteredNews.length && filteredNews.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-[#198639] focus:ring-[#198639] border-gray-300 rounded mr-2"
                  />
                  <span className="text-sm text-gray-700">Select all</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              {filteredNews.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredNews.map((article) => (
                    <div key={article.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedNews.includes(article.id)}
                          onChange={() => handleSelectNews(article.id)}
                          className="absolute top-3 left-3 h-4 w-4 text-[#198639] focus:ring-[#198639] border-gray-300 rounded z-10"
                        />
                        <Image
                          src={article.image}
                          alt={article.title}
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[article.status]}`}>
                            {article.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-[#198639] font-medium bg-[#198639]/10 px-2 py-1 rounded-full">
                            {article.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(article.updatedAt)}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>By {article.author}</span>
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {article.views}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              {article.likes}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/news/${article.id}`}
                            className="flex-1 text-center px-3 py-2 bg-[#198639] text-white rounded-md hover:bg-[#145a2c] text-sm font-medium"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/news/${article.id}`}
                            target="_blank"
                            className="flex-1 text-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                          >
                            Preview
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new article.
                  </p>
                  <div className="mt-6">
                    <Link
                      href="/admin/news/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#198639] hover:bg-[#145a2c]"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      New Article
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}