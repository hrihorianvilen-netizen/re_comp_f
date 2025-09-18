import { ApiResponse } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('adminToken') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ==================== TYPES ====================

export interface PostComment {
  id: string;
  postId: string;
  userId?: string;
  displayName: string;
  user?: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  content: string;
  reactions: {
    love: number;
    sad: number;
    angry: number;
    [key: string]: number;
  };
  replies: PostReply[];
  createdAt: string;
  updatedAt: string;
}

export interface PostReply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  displayName: string;
  user?: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  content: string;
  reaction?: '❤️' | '😢' | '😡';
  reactions: {
    love: number;
    sad: number;
    angry: number;
    selectedReaction?: string;
  };
  createdAt: string;
}

// ==================== POSTS API ====================

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  featuredImage?: string;
  author: string;
  authorId?: string;
  categoryId: string;
  allowComments: boolean;
  hideAds: boolean;
  status: 'draft' | 'published' | 'scheduled' | 'trash';
  publishedAt?: Date | string;
  scheduledAt?: Date | string;
  readTime?: string;
  views: number;
  likes: number;
  shares: number;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  schemaType?: string;
  seoImage?: string;
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  authorUser?: {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
  _count?: {
    comments: number;
  };
  revisions?: PostRevision[];
}

export interface PostRevision {
  id: string;
  postId: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  tags: string[];
  version: number;
  authorId?: string;
  changeLog?: string;
  createdAt: string;
  author?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  parentId?: string;
  displayOrder: number;
  allowComments: boolean;
  hideAds: boolean;
  postCount: number;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    posts: number;
  };
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreatePostData {
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  featuredImage?: string;
  status?: 'draft' | 'published' | 'trash';
  allowComments?: boolean;
  hideAds?: boolean;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  schemaType?: string;
  seoImage?: string;
}

export interface UpdatePostData extends Partial<CreatePostData> {
  changeLog?: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: string;
  displayOrder?: number;
  allowComments?: boolean;
  hideAds?: boolean;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ContentStatistics {
  overview: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    scheduledPosts: number;
    trashedPosts: number;
    totalCategories: number;
    totalComments: number;
    totalViews: number;
  };
  popularPosts: Array<{
    id: string;
    title: string;
    slug: string;
    views: number;
    publishedAt: string;
  }>;
  recentPosts: Array<{
    id: string;
    title: string;
    slug: string;
    publishedAt: string;
    author: string;
  }>;
}

// Posts API
export const contentApi = {
  // ==================== POSTS ====================

  // Get all posts with filters
  async getPosts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    categoryId?: string;
    authorId?: string;
    search?: string;
    tags?: string[];
    isFeatured?: boolean;
    isPinned?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PostsResponse>> {
    try {
      const queryParams = new URLSearchParams();

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, v));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`${API_BASE_URL}/admin/content/posts?${queryParams}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to fetch posts' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { error: 'Failed to fetch posts' };
    }
  },

  // Get single post
  async getPost(identifier: string): Promise<ApiResponse<Post>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/content/posts/${identifier}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to fetch post' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching post:', error);
      return { error: 'Failed to fetch post' };
    }
  },

  // Create post
  async createPost(postData: CreatePostData): Promise<ApiResponse<Post>> {
    try {
      // If we have images as base64, we need to convert them to files
      const formData = new FormData();

      // Add all non-file fields
      Object.keys(postData).forEach(key => {
        if (key !== 'featuredImage' && key !== 'seoImage') {
          const value = postData[key as keyof CreatePostData];
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        }
      });

      // Handle base64 images by converting to blobs
      if (postData.featuredImage && postData.featuredImage.startsWith('data:')) {
        const response = await fetch(postData.featuredImage);
        const blob = await response.blob();
        formData.append('featuredImage', blob, 'featured-image.jpg');
      } else if (postData.featuredImage) {
        formData.append('featuredImage', postData.featuredImage);
      }

      if (postData.seoImage && postData.seoImage.startsWith('data:')) {
        const response = await fetch(postData.seoImage);
        const blob = await response.blob();
        formData.append('seoImage', blob, 'seo-image.jpg');
      } else if (postData.seoImage) {
        formData.append('seoImage', postData.seoImage);
      }

      // Create headers without Content-Type to let browser set it with boundary for multipart
      const authHeaders = getAuthHeaders();
      const headers = Object.entries(authHeaders).reduce((acc, [key, value]) => {
        if (key !== 'Content-Type') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      const response = await fetch(`${API_BASE_URL}/admin/content/posts`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to create post' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error creating post:', error);
      return { error: 'Failed to create post' };
    }
  },

  // Update post
  async updatePost(id: string, postData: UpdatePostData): Promise<ApiResponse<Post>> {
    try {
      // Similar to create, convert to FormData for file uploads
      const formData = new FormData();

      // Add all non-file fields
      Object.keys(postData).forEach(key => {
        if (key !== 'featuredImage' && key !== 'seoImage') {
          const value = postData[key as keyof UpdatePostData];
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        }
      });

      // Handle base64 images by converting to blobs
      if (postData.featuredImage && postData.featuredImage.startsWith('data:')) {
        const response = await fetch(postData.featuredImage);
        const blob = await response.blob();
        formData.append('featuredImage', blob, 'featured-image.jpg');
      } else if (postData.featuredImage) {
        formData.append('featuredImage', postData.featuredImage);
      }

      if (postData.seoImage && postData.seoImage.startsWith('data:')) {
        const response = await fetch(postData.seoImage);
        const blob = await response.blob();
        formData.append('seoImage', blob, 'seo-image.jpg');
      } else if (postData.seoImage) {
        formData.append('seoImage', postData.seoImage);
      }

      // Create headers without Content-Type to let browser set it with boundary for multipart
      const authHeaders = getAuthHeaders();
      const headers = Object.entries(authHeaders).reduce((acc, [key, value]) => {
        if (key !== 'Content-Type') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      const response = await fetch(`${API_BASE_URL}/admin/content/posts/${id}`, {
        method: 'PUT',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to update post' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error updating post:', error);
      return { error: 'Failed to update post' };
    }
  },

  // Delete post
  async deletePost(id: string, permanent?: boolean): Promise<ApiResponse<{ message: string }>> {
    try {
      const url = permanent
        ? `${API_BASE_URL}/admin/content/posts/${id}?permanent=true`
        : `${API_BASE_URL}/admin/content/posts/${id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to delete post' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error deleting post:', error);
      return { error: 'Failed to delete post' };
    }
  },

  // Bulk operations on posts
  async bulkPostOperation(action: string, postIds: string[]): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/content/posts/bulk`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action, postIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to perform bulk operation' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      return { error: 'Failed to perform bulk operation' };
    }
  },

  // Restore post from trash
  async restorePost(id: string): Promise<ApiResponse<Post>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/content/posts/${id}/restore`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to restore post' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error restoring post:', error);
      return { error: 'Failed to restore post' };
    }
  },

  // Duplicate post
  async duplicatePost(id: string): Promise<ApiResponse<Post>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/content/posts/${id}/duplicate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to duplicate post' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error duplicating post:', error);
      return { error: 'Failed to duplicate post' };
    }
  },

  // ==================== CATEGORIES ====================

  // Get all categories
  async getCategories(includeInactive?: boolean): Promise<ApiResponse<Category[]>> {
    try {
      const url = includeInactive
        ? `${API_BASE_URL}/admin/content/categories?includeInactive=true`
        : `${API_BASE_URL}/admin/content/categories`;

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to fetch categories' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { error: 'Failed to fetch categories' };
    }
  },

  // Create category
  async createCategory(categoryData: CreateCategoryData): Promise<ApiResponse<Category>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/content/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to create category' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error creating category:', error);
      return { error: 'Failed to create category' };
    }
  },

  // Update category
  async updateCategory(id: string, categoryData: Partial<CreateCategoryData>): Promise<ApiResponse<Category>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/content/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to update category' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error updating category:', error);
      return { error: 'Failed to update category' };
    }
  },

  // Delete category
  async deleteCategory(id: string, movePostsTo?: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const url = movePostsTo
        ? `${API_BASE_URL}/admin/content/categories/${id}?movePostsTo=${movePostsTo}`
        : `${API_BASE_URL}/admin/content/categories/${id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to delete category' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error deleting category:', error);
      return { error: 'Failed to delete category' };
    }
  },

  // ==================== TAGS ====================

  // Get all tags
  async getTags(): Promise<ApiResponse<Array<{ tag: string; count: number }>>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/content/tags`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to fetch tags' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching tags:', error);
      return { error: 'Failed to fetch tags' };
    }
  },

  // ==================== STATISTICS ====================

  // Get content statistics
  async getStatistics(): Promise<ApiResponse<ContentStatistics>> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/content/statistics`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to fetch statistics' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return { error: 'Failed to fetch statistics' };
    }
  },

  // ==================== POST COMMENTS ====================

  // Create post comment
  async createPostComment(postSlug: string, commentData: {
    content: string;
    displayName: string;
  }): Promise<ApiResponse<PostComment>> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postSlug}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to create comment' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error creating comment:', error);
      return { error: 'Failed to create comment' };
    }
  },

  // Add reaction to post comment
  async addCommentReaction(postSlug: string, commentId: string, reactionType: 'love' | 'sad' | 'angry'): Promise<ApiResponse<{ success: boolean; reactions: Record<string, number> }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postSlug}/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reactionType }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to add reaction' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error adding reaction:', error);
      return { error: 'Failed to add reaction' };
    }
  },

  // Add reply to post comment
  async createPostReply(postSlug: string, commentId: string, replyData: {
    content: string;
    displayName: string;
    reaction?: '❤️' | '😢' | '😡';
  }): Promise<ApiResponse<PostReply>> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postSlug}/comments/${commentId}/replies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(replyData),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to create reply' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error creating reply:', error);
      return { error: 'Failed to create reply' };
    }
  },

  // Track post view
  async trackPostView(postSlug: string): Promise<ApiResponse<{ views: number }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postSlug}/views`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { error: error.error || 'Failed to track view' };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error tracking view:', error);
      return { error: 'Failed to track view' };
    }
  },
};