'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { contentApi, Category } from '@/lib/api/content';
import { toast } from 'react-hot-toast';

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tags: [] as string[],
    featuredImage: '',
    canonicalUrl: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogImage: '',
    allowComments: true,
    hideAds: false,
    isPinned: false,
    isFeatured: false,
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    scheduledAt: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [featuredImagePreview, setFeaturedImagePreview] = useState('');
  const [ogImagePreview, setOgImagePreview] = useState('');

  const fetchCategories = useCallback(async () => {
    const response = await contentApi.getCategories();
    if (response.data) {
      const categoriesData = response.data;
      setCategories(categoriesData);
      // Set first category as default if available
      if (categoriesData.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: categoriesData[0].id }));
      }
    }
  }, [formData.categoryId]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Update image previews
    if (name === 'featuredImage') {
      setFeaturedImagePreview(value);
    } else if (name === 'ogImage') {
      setOgImagePreview(value);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.name === 'tagInput') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return false;
    }
    if (!formData.content.trim()) {
      toast.error('Content is required');
      return false;
    }
    if (!formData.excerpt.trim()) {
      toast.error('Excerpt is required');
      return false;
    }
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return false;
    }
    if (formData.status === 'scheduled' && !formData.scheduledAt) {
      toast.error('Please select a scheduled date for scheduled posts');
      return false;
    }
    return true;
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard this post? All changes will be lost.')) {
      router.push('/admin/posts');
    }
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await contentApi.createPost({
        ...formData,
        status: 'draft'
      });

      if (response.data) {
        toast.success('Post saved as draft successfully!');
        router.push('/admin/posts');
      } else if (response.error) {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await contentApi.createPost({
        ...formData,
        status: formData.status === 'scheduled' ? 'scheduled' : 'published'
      });

      if (response.data) {
        toast.success(`Post ${formData.status === 'scheduled' ? 'scheduled' : 'published'} successfully!`);
        router.push('/admin/posts');
      } else if (response.error) {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error('Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Add New Post</h1>
            <div className="flex gap-3">
              <button
                onClick={handleDiscard}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Discard
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={loading}
                className="px-4 py-2 border border-[#A96B11] rounded-md text-sm font-medium text-[#A96B11] bg-white hover:bg-[#FFF8F0] disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={handlePublish}
                disabled={loading}
                className="px-4 py-2 bg-[#A96B11] text-white text-sm font-medium rounded-md hover:bg-[#8B5A0F] disabled:opacity-50"
              >
                {loading ? 'Publishing...' : formData.status === 'scheduled' ? 'Schedule' : 'Publish'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                    Excerpt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="Brief description of the post"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="Write your post content here..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Note: Rich text editor will be added in future updates
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    id="featuredImage"
                    name="featuredImage"
                    value={formData.featuredImage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {featuredImagePreview && (
                  <div className="border rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featuredImagePreview}
                      alt="Featured preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/400/300';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="SEO optimized title"
                  />
                </div>

                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="SEO description (155-160 characters)"
                  />
                </div>

                <div>
                  <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    id="metaKeywords"
                    name="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div>
                  <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    id="canonicalUrl"
                    name="canonicalUrl"
                    value={formData.canonicalUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="https://example.com/canonical-url"
                  />
                </div>

                <div>
                  <label htmlFor="ogImage" className="block text-sm font-medium text-gray-700 mb-1">
                    Open Graph Image URL
                  </label>
                  <input
                    type="text"
                    id="ogImage"
                    name="ogImage"
                    value={formData.ogImage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>

                {ogImagePreview && (
                  <div className="border rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ogImagePreview}
                      alt="OG Image preview"
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/1200/630';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Publishing Options</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                {formData.status === 'scheduled' && (
                  <div>
                    <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-1">
                      Schedule Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      id="scheduledAt"
                      name="scheduledAt"
                      value={formData.scheduledAt}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="tagInput"
                      name="tagInput"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-[#A96B11] text-white text-sm font-medium rounded-md hover:bg-[#8B5A0F]"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Post Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Post Settings</h2>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="allowComments"
                    checked={formData.allowComments}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Allow Comments</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="hideAds"
                    checked={formData.hideAds}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Hide Advertisements</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Post</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPinned"
                    checked={formData.isPinned}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Pin to Top</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}