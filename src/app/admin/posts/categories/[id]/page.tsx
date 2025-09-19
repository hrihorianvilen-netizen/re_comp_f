'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import AdminHeader from '@/components/admin/shared/AdminHeader';
import SlugInput from '@/components/ui/SlugInput';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { contentApi, Category } from '@/lib/api/content';
import { validateSlugFormat, autoGenerateSlug } from '@/lib/slug';

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    displayOrder: 0,
    isActive: true,
    allowComments: true,
    hideAds: false,
    metaTitle: '',
    metaDescription: '',
  });

  // Fetch category data and all categories for parent dropdown
  useEffect(() => {
    fetchCategoryData();
  }, [categoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      // Fetch the specific category
      const categoryResponse = await contentApi.getCategories(true);
      if (categoryResponse.data) {
        // Find the specific category from the list
        const foundCategory = findCategoryById(categoryResponse.data, categoryId);
        if (foundCategory) {
          setCategory(foundCategory);
          setFormData({
            name: foundCategory.name,
            slug: foundCategory.slug,
            description: foundCategory.description || '',
            parentId: foundCategory.parentId || '',
            displayOrder: foundCategory.displayOrder || 0,
            isActive: foundCategory.isActive !== false,
            allowComments: foundCategory.allowComments !== false,
            hideAds: foundCategory.hideAds || false,
            metaTitle: foundCategory.metaTitle || '',
            metaDescription: foundCategory.metaDescription || '',
          });
        } else {
          toast.error('Category not found');
          router.push('/admin/posts/categories');
        }

        // Flatten categories for dropdown
        const flattenCategories = (cats: Category[], level = 0): Category[] => {
          let result: Category[] = [];
          for (const cat of cats) {
            // Don't include the current category or its children in parent options
            if (cat.id !== categoryId) {
              result.push({
                ...cat,
                name: level > 0 ? `${'— '.repeat(level)}${cat.name}` : cat.name
              });
              if (cat.children && cat.children.length > 0) {
                result = result.concat(flattenCategories(cat.children, level + 1));
              }
            }
          }
          return result;
        };

        setAllCategories(flattenCategories(categoryResponse.data));
      } else {
        toast.error('Failed to fetch category');
        router.push('/admin/posts/categories');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to fetch category');
      router.push('/admin/posts/categories');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to find category by ID in nested structure
  const findCategoryById = (categories: Category[], id: string): Category | null => {
    for (const cat of categories) {
      if (cat.id === id) {
        return cat;
      }
      if (cat.children && cat.children.length > 0) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleFieldChange = (name: string, value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug when name changes
    if (name === 'name' && typeof value === 'string' && isEditing) {
      const newSlug = autoGenerateSlug(value);
      setFormData(prev => ({
        ...prev,
        slug: newSlug
      }));
    }
  };

  const handleSlugChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      slug: value
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('Slug is required');
      return;
    }
    const slugValidation = validateSlugFormat(formData.slug);
    if (!slugValidation.isValid) {
      toast.error(slugValidation.error || 'Invalid slug format');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        parentId: formData.parentId || undefined,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive,
        allowComments: formData.allowComments,
        hideAds: formData.hideAds,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
      };

      const response = await contentApi.updateCategory(categoryId, updateData);
      if (response.data) {
        toast.success('Category updated successfully');
        setCategory(response.data);
        setIsEditing(false);
        // Refresh the data
        fetchCategoryData();
      } else {
        toast.error(response.error || 'Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId || '',
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive !== false,
        allowComments: category.allowComments !== false,
        hideAds: category.hideAds || false,
        metaTitle: category.metaTitle || '',
        metaDescription: category.metaDescription || '',
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this category? Posts in this category will need to be reassigned.')) {
      try {
        const response = await contentApi.deleteCategory(categoryId);
        if (response.data) {
          toast.success('Category deleted successfully');
          router.push('/admin/posts/categories');
        } else {
          toast.error(response.error || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const getStatusBadge = () => {
    if (formData.isActive) {
      return { text: 'Active', color: 'green' as const };
    }
    return { text: 'Inactive', color: 'gray' as const };
  };

  const headerActions = [
    { text: 'Back to Categories', onClick: () => router.push('/admin/posts/categories'), variant: 'secondary' as const },
    ...(isEditing ? [
      { text: 'Discard', onClick: handleDiscard, variant: 'secondary' as const, disabled: saving },
      { text: saving ? 'Saving...' : 'Save Changes', onClick: handleSave, variant: 'primary' as const, disabled: saving }
    ] : [
      { text: 'Edit', onClick: () => setIsEditing(true), variant: 'primary' as const },
      { text: 'Delete', onClick: handleDelete, variant: 'danger' as const }
    ])
  ];

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A96B11]"></div>
            <div className="text-gray-500">Loading category...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">Category not found</p>
          </div>
        </div>
      </div>
    );
  }

  // Find parent category name for display
  const parentCategory = formData.parentId ? allCategories.find(cat => cat.id === formData.parentId) : null;

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminHeader
          title={isEditing ? 'Edit Category' : 'Category Details'}
          badge={getStatusBadge()}
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

                {isEditing ? (
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
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug
                    </label>
                    <p className="text-sm text-gray-600 font-mono">/{formData.slug}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="parent" className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  {isEditing ? (
                    <select
                      id="parent"
                      value={formData.parentId}
                      onChange={(e) => handleFieldChange('parentId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    >
                      <option value="">None (Root Category)</option>
                      {allCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900">
                      {parentCategory?.name || 'None (Root Category)'}
                    </p>
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <RichTextEditor
                      label="Description"
                      value={formData.description}
                      onChange={(value) => handleFieldChange('description', value)}
                      placeholder="Describe this category..."
                      required={false}
                      maxLength={2000}
                      minLength={10}
                      maxLinks={15}
                      maxImages={5}
                      height="min-h-[200px] max-h-[350px]"
                      autoSave={true}
                      showPreview={true}
                    />
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      {formData.description ? (
                        <div className="prose prose-sm max-w-none bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <div dangerouslySetInnerHTML={{ __html: formData.description }} />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No description</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      id="displayOrder"
                      value={formData.displayOrder}
                      onChange={(e) => handleFieldChange('displayOrder', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{formData.displayOrder}</p>
                  )}
                </div>
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
                  {isEditing ? (
                    <input
                      type="text"
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => handleFieldChange('metaTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="SEO optimized title"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{formData.metaTitle || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  {isEditing ? (
                    <RichTextEditor
                      value={formData.metaDescription}
                      onChange={(value) => handleFieldChange('metaDescription', value)}
                      placeholder="Meta description for search engines..."
                      maxLength={160}
                      height="min-h-[80px] max-h-[120px]"
                      showPreview={false}
                      required={false}
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{formData.metaDescription || 'Not set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Status & Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  {isEditing ? (
                    <select
                      id="status"
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => handleFieldChange('isActive', e.target.value === 'active')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  ) : (
                    <p className="text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        formData.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {formData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allowComments}
                      onChange={(e) => handleFieldChange('allowComments', e.target.checked)}
                      disabled={!isEditing}
                      className="rounded border-gray-300 text-[#A96B11] focus:ring-[#A96B11] mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Allow Comments</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.hideAds}
                      onChange={(e) => handleFieldChange('hideAds', e.target.checked)}
                      disabled={!isEditing}
                      className="rounded border-gray-300 text-[#A96B11] focus:ring-[#A96B11] mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Hide Advertisements</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Posts</dt>
                  <dd className="text-sm text-gray-900">{category._count?.posts || category.postCount || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(category.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}