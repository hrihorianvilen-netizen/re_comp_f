'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import AdminHeader from '@/components/admin/shared/AdminHeader';
import SEOSettingsCard from '@/components/admin/shared/SEOSettingsCard';

// Mock category data - in real app this would come from API
const mockCategory = {
  id: '1',
  name: 'Technology',
  slug: 'technology',
  description: 'Latest tech news, reviews, and innovations covering everything from smartphones to artificial intelligence.',
  status: 'published',
  parent: null,
  parentName: '-',
  position: 1,
  postCount: 45,
  canonicalUrl: 'https://example.com/category/technology',
  schemaType: 'Category',
  seoTitle: 'Technology News & Reviews - TechBlog',
  seoDescription: 'Stay updated with the latest technology news, product reviews, and industry insights.',
  seoImage: '/api/placeholder/1200/630',
  allowComments: true,
  hideAdvertisements: false,
  createdAt: '2024-12-01T10:30:00',
  updatedAt: '2025-01-02T14:20:00'
};

export default function CategoryDetailPage() {
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(mockCategory);

  const handleFieldChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving category:', formData);
    setIsEditing(false);
  };

  const handleDiscard = () => {
    setFormData(mockCategory);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      console.log('Deleting category:', params.id);
      window.location.href = '/admin/posts/categories';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      published: { text: 'Published', color: 'green' as const },
      draft: { text: 'Draft', color: 'gray' as const },
      trash: { text: 'Trash', color: 'red' as const },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.draft;
  };

  const headerActions = [
    { text: 'Back to Categories', onClick: () => window.location.href = '/admin/posts/categories', variant: 'secondary' as const },
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
          title={isEditing ? 'Edit Category' : 'Category Details'}
          badge={getStatusBadge(formData.status)}
          actions={headerActions}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{formData.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
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
                  <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  {isEditing ? (
                    <select
                      id="parent"
                      value={formData.parent || ''}
                      onChange={(e) => handleFieldChange('parent', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    >
                      <option value="">None (Root Category)</option>
                      <option value="1">Technology</option>
                      <option value="2">Fashion</option>
                      <option value="3">Lifestyle</option>
                      <option value="4">Business</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900">{formData.parentName || 'None (Root Category)'}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleFieldChange('position', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{formData.position}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Posts</label>
                  <p className="text-sm text-gray-900">{formData.postCount} posts</p>
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

            {/* Description */}
            <div className="bg-white shadow rounded-lg p-6">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                {isEditing ? (
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                  />
                ) : (
                  <div className="prose max-w-none">
                    <p className="text-gray-700">{formData.description}</p>
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
                { value: 'Category', label: 'Category' },
                { value: 'Thing', label: 'Thing' },
                { value: 'Organization', label: 'Organization' },
                { value: 'Place', label: 'Place' }
              ]}
            />
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Category Status */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Category Status</h3>
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
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900 capitalize">{formData.status}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      id="allowComments"
                      checked={formData.allowComments}
                      onChange={(e) => handleFieldChange('allowComments', e.target.checked)}
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                  ) : (
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${formData.allowComments ? 'bg-[#A96B11] border-[#A96B11]' : 'border-gray-300'}`}>
                      {formData.allowComments && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                  <label htmlFor="allowComments" className="ml-2 text-sm text-gray-700">
                    Allow comments
                  </label>
                </div>

                <div className="flex items-center">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      id="hideAdvertisements"
                      checked={formData.hideAdvertisements}
                      onChange={(e) => handleFieldChange('hideAdvertisements', e.target.checked)}
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                  ) : (
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${formData.hideAdvertisements ? 'bg-[#A96B11] border-[#A96B11]' : 'border-gray-300'}`}>
                      {formData.hideAdvertisements && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                  <label htmlFor="hideAdvertisements" className="ml-2 text-sm text-gray-700">
                    {`Don't show advertisements on this page`}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}