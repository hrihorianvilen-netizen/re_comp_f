'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OptimizedImage from '@/components/ui/OptimizedImage';
import SlugInput from '@/components/ui/SlugInput';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { contentApi } from '@/lib/api/content';
import toast from 'react-hot-toast';
import { validateSlugFormat, autoGenerateSlug } from '@/lib/slug';
import type { Category } from '@/lib/api/content';

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    displayOrder: 1,
    isActive: true,
    featuredImage: '',
    canonicalUrl: '',
    schemaType: 'Thing',
    metaTitle: '',
    metaDescription: '',
    seoImage: '',
    allowComments: true,
    hideAds: false
  });

  const [featuredImagePreview, setFeaturedImagePreview] = useState('');
  const [seoImagePreview, setSeoImagePreview] = useState('');

  // Fetch categories for parent selection on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await contentApi.getCategories(true); // Include inactive categories too
        if (response.data) {
          // Flatten nested categories for dropdown
          const flattenCategories = (cats: Category[], level = 0): Category[] => {
            let result: Category[] = [];
            for (const cat of cats) {
              result.push({
                ...cat,
                name: level > 0 ? `${'— '.repeat(level)}${cat.name}` : cat.name
              });
              if (cat.children && cat.children.length > 0) {
                result = result.concat(flattenCategories(cat.children, level + 1));
              }
            }
            return result;
          };

          setCategories(flattenCategories(response.data));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard this category? All changes will be lost.')) {
      router.push('/admin/posts/categories');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return false;
    }
    if (!formData.slug.trim()) {
      toast.error('Slug is required');
      return false;
    }
    const slugValidation = validateSlugFormat(formData.slug);
    if (!slugValidation.isValid) {
      toast.error(slugValidation.error || 'Invalid slug format');
      return false;
    }
    return true;
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await contentApi.createCategory({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        parentId: formData.parentId || undefined,
        displayOrder: formData.displayOrder,
        allowComments: formData.allowComments,
        hideAds: formData.hideAds,
        isActive: false,  // Draft means not active
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription
      });

      if (response.data) {
        toast.success('Category saved as draft successfully!');
        router.push('/admin/posts/categories');
      } else {
        console.error('Failed to save draft:', response.error);
        toast.error(response.error || 'Failed to save category as draft');
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save category as draft');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await contentApi.createCategory({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        parentId: formData.parentId || undefined,
        displayOrder: formData.displayOrder,
        allowComments: formData.allowComments,
        hideAds: formData.hideAds,
        isActive: true,  // Published means active
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription
      });

      if (response.data) {
        toast.success('Category published successfully!');
        router.push('/admin/posts/categories');
      } else {
        console.error('Failed to publish:', response.error);
        toast.error(response.error || 'Failed to publish category');
      }
    } catch (error) {
      console.error('Failed to publish:', error);
      toast.error('Failed to publish category');
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFeaturedImagePreview(value);
    setFormData(prev => ({ ...prev, featuredImage: value }));
  };

  const handleSeoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSeoImagePreview(value);
    setFormData(prev => ({ ...prev, seoImage: value }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const newSlug = autoGenerateSlug(name);
    setFormData(prev => ({
      ...prev,
      name,
      slug: newSlug
    }));
  };

  const handleSlugChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      slug: value
    }));
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Add New Category</h1>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Draft
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDiscard}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Discard
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handlePublish}
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A96B11] hover:bg-[#8B5A0F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="Enter category name"
                    required
                  />
                </div>

                <SlugInput
                  value={formData.slug}
                  onChange={handleSlugChange}
                  sourceText={formData.name}
                  label="URL Slug"
                  required={true}
                  showPreview={true}
                  previewBaseUrl="/categories"
                  className="mb-4"
                />
              </div>
            </div>

            {/* Description */}
            <div className="bg-white shadow rounded-lg p-6">
              <div>
                <RichTextEditor
                  label="Description"
                  value={formData.description}
                  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  placeholder="Describe this category..."
                  required={false}
                  maxLength={2000}
                  minLength={10}
                  maxLinks={15}
                  maxImages={5}
                  height="min-h-[250px] max-h-[400px]"
                  autoSave={true}
                  showPreview={true}
                />
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="SEO optimized title"
                  />
                </div>

                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <RichTextEditor
                    value={formData.metaDescription}
                    onChange={(value) => setFormData(prev => ({ ...prev, metaDescription: value }))}
                    placeholder="Meta description for search engines..."
                    maxLength={160}
                    height="min-h-[80px] max-h-[120px]"
                    showPreview={false}
                    required={false}
                  />
                </div>

                <div>
                  <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Canonical URL
                  </label>
                  <input
                    type="url"
                    id="canonicalUrl"
                    name="canonicalUrl"
                    value={formData.canonicalUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="https://example.com/canonical-url"
                  />
                </div>

                <div>
                  <label htmlFor="schemaType" className="block text-sm font-medium text-gray-700 mb-2">
                    Schema Type
                  </label>
                  <select
                    id="schemaType"
                    name="schemaType"
                    value={formData.schemaType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                  >
                    <option value="Thing">Thing</option>
                    <option value="Category">Category</option>
                    <option value="Organization">Organization</option>
                    <option value="Place">Place</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.seoImage}
                    onChange={handleSeoImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="https://example.com/image.jpg"
                  />
                  {seoImagePreview && (
                    <div className="mt-3">
                      <OptimizedImage
                        src={seoImagePreview}
                        alt="SEO Preview"
                        width={400}
                        height={209}
                        className="w-full max-w-sm h-auto rounded border border-gray-200"
                        style={{ aspectRatio: '1.91/1' }}
                        sizeType="card"
                        qualityPriority="medium"
                      />
                      <p className="text-xs text-gray-500 mt-1">Preview (1.91:1 aspect ratio)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Category Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Category Settings</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <select
                    id="parentId"
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleInputChange}
                    disabled={categoriesLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">None (Root Category)</option>
                    {categoriesLoading ? (
                      <option disabled>Loading categories...</option>
                    ) : (
                      categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    id="displayOrder"
                    name="displayOrder"
                    value={formData.displayOrder}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                  />
                </div>

                <div>
                  <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="isActive"
                    name="isActive"
                    value={formData.isActive.toString()}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                  >
                    <option value="true">Active (Published)</option>
                    <option value="false">Inactive (Draft)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allowComments"
                      checked={formData.allowComments}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-[#A96B11] focus:ring-[#A96B11] mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Allow Comments</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="hideAds"
                      checked={formData.hideAds}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-[#A96B11] focus:ring-[#A96B11] mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Hide Ads</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Featured Image</h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={formData.featuredImage}
                    onChange={handleFeaturedImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="Image URL"
                  />
                </div>
                {featuredImagePreview && (
                  <div className="mt-3">
                    <OptimizedImage
                      src={featuredImagePreview}
                      alt="Featured Image Preview"
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover rounded border border-gray-200"
                      sizeType="card"
                      qualityPriority="medium"
                    />
                    <p className="text-xs text-gray-500 mt-1">Featured Image Preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}