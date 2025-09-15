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

// ==================== POSTS API ====================

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
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
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  tags: string[];
  isPinned: boolean;
  isFeatured: boolean;
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
  content: string;
  excerpt: string;
  categoryId: string;
  featuredImage?: string;
  status?: 'draft' | 'published' | 'scheduled' | 'trash';
  scheduledAt?: string;
  allowComments?: boolean;
  hideAds?: boolean;
  tags?: string[];
  isPinned?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
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
      const response = await fetch(`${API_BASE_URL}/admin/content/posts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(postData),
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
      const response = await fetch(`${API_BASE_URL}/admin/content/posts/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(postData),
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
};