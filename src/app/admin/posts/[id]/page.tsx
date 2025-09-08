'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AdminHeader from '@/components/admin/shared/AdminHeader';
import SEOSettingsCard from '@/components/admin/shared/SEOSettingsCard';

// Mock post data - in real app this would come from API
const mockPost = {
  id: '1',
  title: 'The Future of E-commerce Technology',
  slug: 'future-of-ecommerce-technology',
  content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  status: 'published',
  author: 'John Smith',
  category: 'technology',
  tags: 'technology, ecommerce, future',
  featuredImage: '/api/placeholder/400/300',
  canonicalUrl: 'https://example.com/future-of-ecommerce-technology',
  schemaType: 'Article',
  seoTitle: 'The Future of E-commerce Technology - TechBlog',
  seoDescription: 'Explore the latest trends and innovations shaping the future of e-commerce technology.',
  seoImage: '/api/placeholder/1200/630',
  createdAt: '2024-12-01T10:30:00',
  updatedAt: '2025-01-02T14:20:00'
};

export default function PostDetailPage() {
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(mockPost);

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving post:', formData);
    setIsEditing(false);
  };

  const handleDiscard = () => {
    setFormData(mockPost);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      console.log('Deleting post:', params.id);
      // Navigate back to posts list
      window.location.href = '/admin/posts';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      published: { text: 'Published', color: 'green' as const },
      draft: { text: 'Draft', color: 'gray' as const },
      archived: { text: 'Archived', color: 'blue' as const },
      trash: { text: 'Trash', color: 'red' as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
  };

  const headerActions = [
    { text: 'Back to Posts', onClick: () => window.location.href = '/admin/posts', variant: 'secondary' as const },
    ...(isEditing ? [
      { text: 'Discard', onClick: handleDiscard, variant: 'secondary' as const },
      { text: 'Save Changes', onClick: handleSave, variant: 'primary' as const }
    ] : [
      { text: 'Edit', onClick: () => setIsEditing(true), variant: 'primary' as const },
      { text: 'Delete', onClick: handleDelete, variant: 'danger' as const }
    ])
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminHeader
          title={isEditing ? 'Edit Post' : 'Post Details'}
          badge={getStatusBadge(formData.status)}
          actions={headerActions}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Post Title
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{formData.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleFieldChange('slug', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 font-mono">/{formData.slug}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <p className="text-sm text-gray-900">{formData.author}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                  <p className="text-sm text-gray-600">{new Date(formData.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                  <p className="text-sm text-gray-600">{new Date(formData.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white shadow rounded-lg p-6">
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Post Content
                </label>
                {isEditing ? (
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleFieldChange('content', e.target.value)}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                  />
                ) : (
                  <div className="prose max-w-none">
                    <p className="text-gray-700">{formData.content}</p>
                  </div>
                )}
              </div>
            </div>

            {/* SEO Settings */}
            <SEOSettingsCard
              seoTitle={formData.seoTitle}
              seoDescription={formData.seoDescription}
              canonicalUrl={formData.canonicalUrl}
              schemaType={formData.schemaType}
              seoImage={formData.seoImage}
              onFieldChange={handleFieldChange}
              schemaOptions={[
                { value: 'Article', label: 'Article' },
                { value: 'BlogPosting', label: 'Blog Posting' },
                { value: 'NewsArticle', label: 'News Article' },
                { value: 'Review', label: 'Review' }
              ]}
            />
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Post Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Post Settings</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  {isEditing ? (
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleFieldChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900 capitalize">{formData.status}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  {isEditing ? (
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleFieldChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    >
                      <option value="technology">Technology</option>
                      <option value="fashion">Fashion</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="business">Business</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900 capitalize">{formData.category}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleFieldChange('tags', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="Separate tags with commas"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{formData.tags}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Featured Image</h3>
              <div className="space-y-4">
                {formData.featuredImage && (
                  <div>
                    <img
                      src={formData.featuredImage}
                      alt="Featured Image"
                      className="w-full h-48 object-cover rounded border border-gray-200"
                    />
                  </div>
                )}
                {isEditing && (
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#A96B11] file:text-white hover:file:bg-[#8B5A0F]"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}