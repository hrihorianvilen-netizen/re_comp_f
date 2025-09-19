'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OptimizedImage from '@/components/ui/OptimizedImage';
import AdminHeader from '@/components/admin/shared/AdminHeader';
import FileUpload from '@/components/ui/FileUpload';
import SlugInput from '@/components/ui/SlugInput';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { contentApi } from '@/lib/api/content';
import toast from 'react-hot-toast';
import { validateSlugFormat, autoGenerateSlug } from '@/lib/slug';
import type { Post, Category } from '@/lib/api/content';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'draft' as 'draft' | 'published' | 'trash',
    author: '',
    categoryId: '',
    tags: [] as string[],
    featuredImage: '',
    canonicalUrl: '',
    schemaType: 'Article',
    seoTitle: '',
    seoDescription: '',
    seoImage: '',
    allowComments: true,
    hideAds: false,
    readTime: '5 min read'
  });


  // Fetch post and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const postId = params.id as string;

        // Fetch post
        const postResponse = await contentApi.getPost(postId);
        if (postResponse.data) {
          const postData = postResponse.data;
          setPost(postData);
          setFormData({
            title: postData.title || '',
            slug: postData.slug || '',
            content: postData.content || '',
            status: (postData.status === 'scheduled' ? 'draft' : postData.status || 'draft') as 'draft' | 'published' | 'trash',
            author: postData.author || '',
            categoryId: postData.categoryId || '',
            tags: Array.isArray(postData.tags) ? postData.tags : [],
            featuredImage: postData.featuredImage || '',
            canonicalUrl: postData.canonicalUrl || '',
            schemaType: postData.schemaType || 'Article',
            seoTitle: postData.seoTitle || '',
            seoDescription: postData.seoDescription || '',
            seoImage: postData.seoImage || '',
            allowComments: postData.allowComments ?? true,
            hideAds: postData.hideAds ?? false,
            readTime: postData.readTime || '5 min read'
          });
        }

        // Fetch categories
        const categoriesResponse = await contentApi.getCategories();
        if (categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load post');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleFieldChange = (name: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug when title changes
    if (name === 'title' && typeof value === 'string' && isEditing) {
      const newSlug = autoGenerateSlug(value);
      setFormData(prev => ({
        ...prev,
        slug: newSlug
      }));
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({
      ...prev,
      tags
    }));
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
    if (!formData.categoryId) {
      toast.error('Category is required');
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

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const postId = params.id as string;
      const updateData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        status: formData.status as 'draft' | 'published' | 'trash',
        categoryId: formData.categoryId,
        tags: formData.tags,
        featuredImage: formData.featuredImage,
        allowComments: formData.allowComments,
        hideAds: formData.hideAds,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        canonicalUrl: formData.canonicalUrl,
        schemaType: formData.schemaType,
        seoImage: formData.seoImage
      };

      const response = await contentApi.updatePost(postId, updateData);

      if (response.data) {
        toast.success('Post updated successfully!');
        setPost(response.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      toast.error('Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (post) {
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        content: post.content || '',
        status: (post.status === 'scheduled' ? 'draft' : post.status || 'draft') as 'draft' | 'published' | 'trash',
        author: post.author || '',
        categoryId: post.categoryId || '',
        tags: Array.isArray(post.tags) ? post.tags : [],
        featuredImage: post.featuredImage || '',
        canonicalUrl: post.canonicalUrl || '',
        schemaType: post.schemaType || 'Article',
        seoTitle: post.seoTitle || '',
        seoDescription: post.seoDescription || '',
        seoImage: post.seoImage || '',
        allowComments: post.allowComments ?? true,
        hideAds: post.hideAds ?? false,
        readTime: post.readTime || '5 min read'
      });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setLoading(true);
      try {
        const postId = params.id as string;
        await contentApi.deletePost(postId);
        toast.success('Post deleted successfully!');
        router.push('/admin/posts');
      } catch (error) {
        console.error('Failed to delete post:', error);
        toast.error('Failed to delete post');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const postId = params.id as string;
      const updateData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        status: 'published' as const,
        categoryId: formData.categoryId,
        tags: formData.tags,
        featuredImage: formData.featuredImage,
        allowComments: formData.allowComments,
        hideAds: formData.hideAds,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        canonicalUrl: formData.canonicalUrl,
        schemaType: formData.schemaType,
        seoImage: formData.seoImage
      };

      const response = await contentApi.updatePost(postId, updateData);

      if (response.data) {
        toast.success('Post published successfully!');
        setPost(response.data);
        setFormData(prev => ({ ...prev, status: 'published' }));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to publish post:', error);
      toast.error('Failed to publish post');
    } finally {
      setLoading(false);
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
    { text: 'Back to Posts', onClick: () => router.push('/admin/posts'), variant: 'secondary' as const },
    ...(isEditing ? [
      { text: loading ? '⟳ Discarding...' : 'Discard', onClick: handleDiscard, variant: 'secondary' as const, disabled: loading },
      { text: loading ? '⟳ Saving...' : 'Save Changes', onClick: handleSave, variant: 'primary' as const, disabled: loading },
      ...(formData.status === 'draft' ? [
        { text: loading ? '⟳ Publishing...' : 'Publish', onClick: handlePublish, variant: 'primary' as const, disabled: loading }
      ] : [])
    ] : [
      { text: 'Edit', onClick: () => setIsEditing(true), variant: 'primary' as const },
      { text: loading ? '⟳ Deleting...' : 'Delete', onClick: handleDelete, variant: 'danger' as const, disabled: loading }
    ])
  ];

  if (initialLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A96B11]"></div>
            <div className="text-gray-500">Loading post details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-gray-500">Post not found</div>
            <button
              onClick={() => router.push('/admin/posts')}
              className="mt-4 px-4 py-2 bg-[#A96B11] text-white rounded-md hover:bg-[#8B5A0F]"
            >
              Back to Posts
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 relative">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-[#00000080] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A96B11]"></div>
            <div className="text-gray-700 font-medium">Processing...</div>
          </div>
        </div>
      )}

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

                {isEditing ? (
                  <SlugInput
                    value={formData.slug}
                    onChange={(value) => handleFieldChange('slug', value)}
                    sourceText={formData.title}
                    label="URL Slug"
                    required={true}
                    showPreview={true}
                    previewBaseUrl="/posts"
                    className="mb-4"
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug
                    </label>
                    <p className="text-sm text-gray-600 font-mono">/{formData.slug}</p>
                  </div>
                )}


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => handleFieldChange('author', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="Author name"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{formData.author || 'Unknown'}</p>
                  )}
                </div>

                {post && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                      <p className="text-sm text-gray-600">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                      <p className="text-sm text-gray-600">{new Date(post.updatedAt).toLocaleString()}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="bg-white shadow rounded-lg p-6">
              <div>
                {isEditing ? (
                  <RichTextEditor
                    label="Post Content"
                    value={formData.content}
                    onChange={(value) => handleFieldChange('content', value)}
                    placeholder="Write your post content here..."
                    required={true}
                    maxLength={10000}
                    minLength={50}
                    maxLinks={50}
                    maxImages={20}
                    height="min-h-[400px] max-h-[600px]"
                    autoSave={true}
                    showPreview={true}
                  />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post Content
                    </label>
                    <div className="prose max-w-none bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SEO Settings */}
            {isEditing ? (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      id="seoTitle"
                      value={formData.seoTitle}
                      onChange={(e) => handleFieldChange('seoTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="SEO optimized title"
                    />
                  </div>

                  <div>
                    <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Description
                    </label>
                    <RichTextEditor
                      value={formData.seoDescription}
                      onChange={(value) => handleFieldChange('seoDescription', value)}
                      placeholder="SEO description (155-160 characters)"
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
                      value={formData.canonicalUrl}
                      onChange={(e) => handleFieldChange('canonicalUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="https://example.com/page (optional)"
                    />
                  </div>

                  <div>
                    <label htmlFor="schemaType" className="block text-sm font-medium text-gray-700 mb-2">
                      Schema Type
                    </label>
                    <select
                      id="schemaType"
                      value={formData.schemaType}
                      onChange={(e) => handleFieldChange('schemaType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    >
                      <option value="Article">Article</option>
                      <option value="BlogPosting">Blog Posting</option>
                      <option value="NewsArticle">News Article</option>
                      <option value="Review">Review</option>
                    </select>
                  </div>

                  <div>
                    <FileUpload
                      accept="image/*"
                      maxSize={300 * 1024} // 300KB
                      value={formData.seoImage}
                      onChange={(_file, dataUrl) => {
                        handleFieldChange('seoImage', dataUrl || '');
                      }}
                      preview={true}
                      placeholder="Upload SEO image"
                      label="SEO Image (1.91:1 ratio, 1200×630px recommended)"
                      aspectRatio="1.91/1"
                      maxWidth="max-w-sm"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                    <p className="text-sm text-gray-900">{formData.seoTitle || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                    <p className="text-sm text-gray-900">{formData.seoDescription || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Canonical URL</label>
                    <p className="text-sm text-gray-900">{formData.canonicalUrl || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schema Type</label>
                    <p className="text-sm text-gray-900">{formData.schemaType}</p>
                  </div>
                  {formData.seoImage && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SEO Image</label>
                      <OptimizedImage
                        src={formData.seoImage}
                        alt="SEO Image"
                        width={384}
                        height={201}
                        className="w-full max-w-sm h-auto rounded border border-gray-200"
                        style={{ aspectRatio: '1.91/1' }}
                        sizeType="card"
                        qualityPriority="medium"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Post Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Post Settings</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  {isEditing ? (
                    <select
                      id="category"
                      value={formData.categoryId}
                      onChange={(e) => handleFieldChange('categoryId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900">
                      {categories.find(c => c.id === formData.categoryId)?.name || 'Uncategorized'}
                    </p>
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
                      value={formData.tags.join(', ')}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="Separate tags with commas"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">
                      {formData.tags.length > 0 ? formData.tags.join(', ') : 'No tags'}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Read Time
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="readTime"
                      value={formData.readTime}
                      onChange={(e) => handleFieldChange('readTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="e.g. 5 min read"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{formData.readTime}</p>
                  )}
                </div>

                <div className="space-y-2">
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
                    <span className="text-sm font-medium text-gray-700">Hide Ads</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Featured Image</h3>
              <div className="space-y-4">
                {isEditing ? (
                  <FileUpload
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                    value={formData.featuredImage}
                    onChange={(_file, dataUrl) => {
                      handleFieldChange('featuredImage', dataUrl || '');
                    }}
                    preview={true}
                    placeholder="Upload featured image"
                    label="Featured Image"
                    aspectRatio="16/9"
                    maxWidth="max-w-md"
                  />
                ) : (
                  formData.featuredImage && (
                    <OptimizedImage
                      src={formData.featuredImage}
                      alt="Featured Image"
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover rounded border border-gray-200"
                      sizeType="card"
                      qualityPriority="medium"
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}