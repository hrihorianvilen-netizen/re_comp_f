import { User, Merchant, Review, Post, AuthResponse, MerchantsResponse, ReviewsResponse, PostsResponse, ReviewComment } from '@/types/api';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://reviews-backend-2zkw.onrender.com/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Check if body is FormData
    const isFormData = options.body instanceof FormData;
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    
    // Only set Content-Type for non-FormData requests
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || data.message || 'An error occurred',
          data: undefined
        };
      }

      return { data };
    } catch (error) {
      return {
        error: 'Network error. Please check your connection.',
        data: undefined
      };
    }
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
    name?: string;
    displayName?: string;
  }) {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe() {
    return this.request<{ user: User }>('/auth/me');
  }

  async logout() {
    const result = await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
    return result;
  }

  // Merchant endpoints
  async getMerchants(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
    excludeDrafts?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return this.request<MerchantsResponse>(`/merchants${query ? `?${query}` : ''}`);
  }

  async getMerchant(slug: string) {
    return this.request<{ merchant: Merchant }>(`/merchants/${slug}`);
  }

  async getMerchantCategories() {
    return this.request<{ categories: { name: string; count: number }[] }>('/merchants/categories/list');
  }

  async getRecentMerchants(limit: number = 30) {
    return this.request<{
      merchants: Merchant[];
      total: number;
    }>(`/merchants/recent?limit=${limit}`);
  }

  async trackMerchantVisit(slug: string) {
    return this.request(`/merchants/${slug}/visit`, { method: 'POST' });
  }

  // Review endpoints
  async getReviews(params?: {
    page?: number;
    limit?: number;
    merchantId?: string;
    merchantSlug?: string;
    rating?: number;
    sort?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return this.request<ReviewsResponse>(`/reviews${query ? `?${query}` : ''}`);
  }

  async getReview(slug: string) {
    return this.request<{ review: Review }>(`/reviews/${slug}`);
  }

  async createReview(reviewData: {
    merchantId: string;
    title: string;
    rating: number;
    content: string;
    displayName?: string;
  }) {
    return this.request<{ review: Review; message: string }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async markReviewHelpful(reviewId: string) {
    return this.request(`/reviews/${reviewId}/helpful`, { method: 'POST' });
  }

  async markReviewNotHelpful(reviewId: string) {
    return this.request(`/reviews/${reviewId}/not-helpful`, { method: 'POST' });
  }

  async reportReview(reviewId: string, reason?: string) {
    return this.request<{ message: string }>(`/reviews/${reviewId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || 'Content reported by user for review' }),
    });
  }

  async addComment(reviewId: string, commentData: {
    reaction: '❤️' | '😢' | '😡';
    content?: string;
    displayName?: string;
  }) {
    return this.request<{ comment: ReviewComment; message: string }>(`/reviews/${reviewId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  // Posts endpoints
  async getPosts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return this.request<PostsResponse>(`/posts${query ? `?${query}` : ''}`);
  }

  async getPost(slug: string) {
    return this.request<{ post: Post }>(`/posts/${slug}`);
  }

  // Admin endpoints (require admin authentication)
  async getAdminMerchants(params?: {
    page?: number;
    limit?: number;
    query?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return this.request<MerchantsResponse>(`/admin/merchants${query ? `?${query}` : ''}`);
  }

  async getAdminMerchant(id: string) {
    return this.request<{ merchant: Merchant }>(`/admin/merchants/${id}`);
  }

  async createAdminMerchant(merchantData: FormData) {
    return this.request<{ merchant: Merchant; message: string }>('/admin/merchants', {
      method: 'POST',
      body: merchantData,
    });
  }

  async updateAdminMerchant(id: string, merchantData: FormData) {
    return this.request<{ merchant: Merchant; message: string }>(`/admin/merchants/${id}`, {
      method: 'PUT',
      body: merchantData,
    });
  }

  async deleteAdminMerchant(id: string) {
    return this.request(`/admin/merchants/${id}`, { method: 'DELETE' });
  }

  async bulkActionMerchants(action: 'publish' | 'deactivate', ids: string[]) {
    return this.request('/admin/merchants/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, ids }),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;