import { User, Merchant, Review, Post, AuthResponse, MerchantsResponse, ReviewsResponse, PostsResponse, ReviewComment, Advertisement } from '@/types/api';

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

      // Handle non-JSON responses (like 404 HTML pages)
      const contentType = response.headers.get('content-type');
      let data: Record<string, unknown> = {};
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // If not JSON, try to read as text for debugging
        await response.text(); // Read and discard text content
        data = { message: `Server returned non-JSON response (status: ${response.status})` };
      }

      if (!response.ok) {
        
        let errorMessage = `Request failed with status ${response.status}: ${response.statusText}`;
        
        // Handle specific HTTP status codes with user-friendly messages
        if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
        } else if (response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. You do not have permission to perform this action.';
        } else if (response.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (typeof data === 'object' && data !== null) {
          if ('error' in data) {
            const error = (data as { error?: unknown }).error;
            if (typeof error === 'string') {
              errorMessage = error;
            } else if (typeof error === 'object' && error !== null && 'message' in error) {
              errorMessage = String((error as { message?: unknown }).message);
            } else {
              errorMessage = JSON.stringify(error);
            }
          } else if ('message' in data) {
            errorMessage = String((data as { message?: unknown }).message);
          }
        }
        
        return {
          error: errorMessage,
          data: undefined
        };
      }

      return { data: data as T };
    } catch (error) {
      console.error('API request error:', { url, error });
      return {
        error: error instanceof Error ? error.message : 'Network error. Please check your connection.',
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

  async registerAdmin(userData: {
    email: string;
    password: string;
    name?: string;
    displayName?: string;
    adminSecret: string;
  }) {
    return this.request<AuthResponse>('/auth/register-admin', {
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

  async updateProfile(userData: {
    name?: string;
    displayName?: string;
    phone?: string;
    email?: string;
  }) {
    return this.request<{ user: User; message: string }>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async uploadAvatar(avatar: File) {
    const formData = new FormData();
    formData.append('avatar', avatar);

    return this.request<{ user: User; message: string }>('/user/avatar/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async updateAvatarUrl(avatarUrl: string) {
    return this.request<{ user: User; message: string }>('/user/avatar', {
      method: 'PUT',
      body: JSON.stringify({ avatar: avatarUrl }),
    });
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    return this.request('/user/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(data: {
    token: string;
    newPassword: string;
  }) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
    captchaToken?: string;
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

  async getComments(reviewId: string) {
    return this.request<{ comments: ReviewComment[] }>(`/reviews/${reviewId}/comments`);
  }

  async updateComment(commentId: string, commentData: {
    reaction?: '❤️' | '😢' | '😡';
    content?: string;
  }) {
    return this.request<{ comment: ReviewComment; message: string }>(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(commentData),
    });
  }

  async deleteComment(commentId: string) {
    return this.request<{ message: string }>(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  async reportComment(commentId: string, reason?: string) {
    return this.request<{ message: string }>(`/comments/${commentId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || 'Comment reported by user for review' }),
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

  // Post comment endpoints
  async getPostComments(postSlug: string) {
    return this.request<{ comments: Array<{
      id: string;
      postId: string;
      userId?: string;
      displayName: string;
      content: string;
      reactions: Record<string, number>;
      replies: Array<{
        id: string;
        content: string;
        displayName: string;
        createdAt: string;
      }>;
      createdAt: string;
      updatedAt: string;
    }> }>(`/posts/${postSlug}/comments`);
  }

  async createPostComment(postSlug: string, commentData: {
    content: string;
    displayName: string;
  }) {
    return this.request<{ comment: {
      id: string;
      postId: string;
      displayName: string;
      content: string;
      createdAt: string;
    }; message: string }>(`/posts/${postSlug}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async addPostCommentReaction(postSlug: string, commentId: string, reactionType: string) {
    return this.request<{ success: boolean; message: string }>(`/posts/${postSlug}/comments/${commentId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ type: reactionType }),
    });
  }

  async createPostCommentReply(postSlug: string, commentId: string, replyData: {
    content: string;
    displayName: string;
  }) {
    return this.request<{ reply: {
      id: string;
      commentId: string;
      displayName: string;
      content: string;
      createdAt: string;
    }; message: string }>(`/posts/${postSlug}/comments/${commentId}/replies`, {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
  }

  async trackPostView(postSlug: string) {
    return this.request<{ success: boolean }>(`/posts/${postSlug}/view`, {
      method: 'POST',
    });
  }

  async likePost(postSlug: string) {
    return this.request<{ likes: number }>(`/posts/${postSlug}/like`, {
      method: 'POST',
    });
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

  // User management endpoints (admin only)
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'suspended';
    sort?: 'newest' | 'oldest' | 'name';
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
    return this.request<{
      users: User[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/admin/users${query ? `?${query}` : ''}`);
  }

  async getUserById(id: string) {
    return this.request<{ user: User }>(`/admin/users/${id}`);
  }

  async createUser(userData: {
    displayName: string;
    email: string;
    phone?: string;
    password: string;
    role?: 'user' | 'merchant_admin' | 'moderator' | 'admin';
    merchantId?: string;
    requirePasswordReset?: boolean;
    status?: 'active' | 'inactive' | 'suspended';
    suspensionType?: 'account' | 'email';
    suspensionReason?: string;
    suspensionDuration?: number;
  }) {
    return this.request<{ user: User; message: string; requirePasswordReset: boolean }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUserStatus(id: string, data: {
    status: 'active' | 'inactive' | 'suspended';
    suspensionType?: 'account' | 'email';
    suspensionReason?: string;
    suspensionDuration?: number;
  }) {
    return this.request<{ user: User; message: string }>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkActionUsers(action: 'suspend' | 'activate' | 'delete', ids: string[]) {
    return this.request('/admin/users/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, ids }),
    });
  }

  // Ads management endpoints (admin only)
  async getAds(params?: {
    page?: number;
    limit?: number;
    status?: 'draft' | 'published' | 'archive' | 'trash';
    slot?: 'top' | 'sidebar' | 'footer' | 'inline';
    merchantId?: string;
    sortBy?: 'createdAt' | 'order' | 'impressions' | 'clicks' | 'ctr';
    sortOrder?: 'asc' | 'desc';
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
    return this.request<{
      ads: Advertisement[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/admin/ads${query ? `?${query}` : ''}`);
  }

  async createAd(adData: FormData | {
    title: string;
    description?: string;
    imageUrl?: string;
    targetUrl?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    merchantId?: string;
    slot: 'top' | 'sidebar' | 'footer' | 'inline';
    order?: number;
    duration: '1d' | '3d' | '7d' | '2w' | '1m' | '2m' | '3m' | 'custom';
    startDate?: string;
    endDate?: string;
    status?: 'draft' | 'published';
  }) {
    const isFormData = adData instanceof FormData;
    return this.request<{ ad: Advertisement; message: string }>('/admin/ads', {
      method: 'POST',
      body: isFormData ? adData : JSON.stringify(adData),
    });
  }

  async getAd(id: string) {
    return this.request<{ ad: Advertisement }>(`/admin/ads/${id}`);
  }

  async updateAd(id: string, adData: FormData | {
    title?: string;
    description?: string;
    imageUrl?: string;
    targetUrl?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    merchantId?: string;
    slot?: 'top' | 'sidebar' | 'footer' | 'inline';
    order?: number;
    duration?: '1d' | '3d' | '7d' | '2w' | '1m' | '2m' | '3m' | 'custom';
    startDate?: string;
    endDate?: string;
    status?: 'draft' | 'published' | 'archive' | 'trash';
  }) {
    return this.request<{ ad: Advertisement; message: string }>(`/admin/ads/${id}`, {
      method: 'PUT',
      body: adData instanceof FormData ? adData : JSON.stringify(adData),
    });
  }

  async deleteAd(id: string) {
    return this.request<{ message: string }>(`/admin/ads/${id}`, {
      method: 'DELETE',
    });
  }

  async publishAd(id: string) {
    return this.request<{ ad: Advertisement; message: string }>(`/admin/ads/${id}/publish`, {
      method: 'POST',
    });
  }

  async archiveAd(id: string) {
    return this.request<{ ad: Advertisement; message: string }>(`/admin/ads/${id}/archive`, {
      method: 'POST',
    });
  }

  async restoreAd(id: string) {
    return this.request<{ ad: Advertisement; message: string }>(`/admin/ads/${id}/restore`, {
      method: 'POST',
    });
  }

  async permanentDeleteAd(id: string) {
    return this.request<{ message: string }>(`/admin/ads/${id}/permanent`, {
      method: 'DELETE',
    });
  }

  async getDisplayAds(slot: string, merchantId?: string) {
    const params = new URLSearchParams({ slot });
    if (merchantId) params.append('merchantId', merchantId);
    return this.request<{ ads: Advertisement[] }>(`/ads/display?${params.toString()}`);
  }

  async trackAdClick(adId: string) {
    return this.request<{ targetUrl: string }>(`/ads/${adId}/click`, {
      method: 'POST',
    });
  }

  // Gift Code API Methods
  async getAvailableGiftCodes(merchantSlug: string) {
    return this.request<{
      merchant: { id: string; name: string };
      promotions: Array<{
        id: string;
        title: string;
        description: string;
        type: string;
        loginRequired: boolean;
        reviewRequired: boolean;
        isAvailable: boolean;
        hasUserClaimed: boolean;
        remainingCodes: number | null;
        startDate: string | null;
        endDate: string | null;
      }>;
    }>(`/giftcodes/available/${merchantSlug}`);
  }

  async claimGiftCode(promotionId: string, displayName?: string) {
    return this.request<{
      success: boolean;
      code: string;
      promotion: {
        title: string;
        description: string;
        merchant: string;
      };
      claimId: string;
    }>('/giftcodes/claim', {
      method: 'POST',
      body: JSON.stringify({ promotionId, displayName }),
    });
  }

  async getMyClaimedGiftCodes() {
    return this.request<{
      claims: Array<{
        id: string;
        claimedAt: string;
        code: string;
        promotion: {
          title: string;
          description: string;
          merchant: {
            name: string;
            slug: string;
            logo?: string;
          };
        };
      }>;
    }>('/giftcodes/my-claims');
  }

  async validateGiftCodeClaim(promotionId: string) {
    return this.request<{
      canClaim: boolean;
      reasons: string[];
      requirements: {
        loginRequired: boolean;
        reviewRequired: boolean;
        isLoggedIn: boolean;
        hasReview: boolean;
      };
    }>('/giftcodes/validate', {
      method: 'POST',
      body: JSON.stringify({ promotionId }),
    });
  }

  // User's own reviews
  async getMyReviews(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    // First get the current user info
    const userResult = await this.getMe();
    if (!userResult.data?.user) {
      return { error: 'Not authenticated' };
    }

    const searchParams = new URLSearchParams();
    // Add user ID to filter only current user's reviews
    searchParams.append('userId', userResult.data.user.id);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && key !== 'userId') {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    return this.request<{
      reviews: Review[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/reviews${query ? '?' + query : ''}`);
  }

  async deleteMyReview(reviewId: string) {
    return this.request<{ success: boolean; message?: string }>(
      `/reviews/${reviewId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // Admin Reviews endpoints
  async getAdminReviews(params?: {
    page?: number;
    limit?: number;
    query?: string;
    merchant?: string;
    rating?: number;
    dateFrom?: string;
    dateTo?: string;
    status?: 'published' | 'spam' | 'trash' | 'pending';
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
    const endpoint = `/admin/reviews${query ? `?${query}` : ''}`;
    
    console.log('getAdminReviews - calling endpoint:', endpoint);
    console.log('getAdminReviews - params:', params);
    console.log('getAdminReviews - token present:', !!this.token);
    
    const result = await this.request<{
      reviews: Review[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(endpoint);
    
    console.log('getAdminReviews - result:', result);
    return result;
  }

  async getAdminReview(id: string) {
    return this.request<{
      review: Review;
      reports: Array<{
        metadata: Record<string, unknown>;
        ipAddress: string;
        createdAt: string;
      }>;
    }>(`/admin/reviews/${id}`);
  }

  async getReviewStatus(id: string) {
    return this.request<{ status: 'published' | 'spam' | 'trash' | 'pending' }>(`/admin/reviews/${id}/status`);
  }

  async updateReviewStatus(id: string, status: 'published' | 'spam' | 'trash' | 'pending') {
    return this.request<{ message: string; review: Review }>(`/admin/reviews/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async toggleReviewFeature(id: string) {
    return this.request<{ message: string; isFeatured: boolean }>(`/admin/reviews/${id}/feature`, {
      method: 'PUT',
    });
  }

  async bulkActionReviews(action: 'publish' | 'spam' | 'trash', ids: string[]) {
    return this.request<{ message: string; updatedCount: number }>('/admin/reviews/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, ids }),
    });
  }

  async updateAdminReview(id: string, reviewData: { title: string; content: string }) {
    console.log('updateAdminReview called with:', { id, reviewData });
    
    // Try both PATCH and PUT methods
    const methods = ['PATCH', 'PUT'];
    let result: { error?: string; data?: unknown } | null = null;
    
    for (const method of methods) {
      console.log(`Trying ${method} method...`);
      result = await this.request<{ message: string; review: Review }>(`/admin/reviews/${id}`, {
        method,
        body: JSON.stringify(reviewData),
      });
      
      // If successful, return the result
      if (!result.error) {
        console.log(`${method} method successful!`);
        return result;
      }
      
      // Log the error for debugging
      console.log(`${method} method failed:`, result.error);
      
      // If it's not a method not allowed error, break (probably endpoint doesn't exist)
      if (!result.error.includes('405') && !result.error.includes('Method Not Allowed')) {
        break;
      }
    }
    
    // If we get here, the endpoint probably doesn't exist
    // Provide a more helpful error message
    if (result?.error?.includes('404') || 
        result?.error?.includes('Not Found') || 
        result?.error?.includes('not found') || 
        result?.error?.includes('Route') && result?.error?.includes('not found')) {
      return {
        error: 'Backend API endpoint for updating review content is not implemented yet. Please contact the backend developer to add PUT or PATCH /admin/reviews/{id} endpoint.',
        data: undefined
      };
    }
    
    console.log('updateAdminReview final response:', result);
    return result;
  }
  async deleteAdminReview(id: string) {
    return this.request<{ message: string }>(`/admin/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Comments Management
  async getAdminComments(params?: {
    page?: number;
    limit?: number;
    query?: string;
    status?: string;
    reaction?: string;
    dateFrom?: string;
    dateTo?: string;
    reviewId?: string;
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
    return this.request<{
      comments: ReviewComment[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/admin/comments${query ? `?${query}` : ''}`);
  }

  async getAdminComment(id: string) {
    return this.request<{
      comment: ReviewComment;
      reports: Array<{
        metadata: Record<string, unknown>;
        ipAddress: string;
        createdAt: string;
      }>;
    }>(`/admin/comments/${id}`);
  }

  async updateAdminComment(id: string, data: { content?: string; displayName?: string; reaction?: string }) {
    return this.request<{ message: string; comment: ReviewComment }>(`/admin/comments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateCommentStatus(id: string, status: string) {
    return this.request<{ message: string; comment: ReviewComment }>(`/admin/comments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async bulkActionComments(action: string, ids: string[]) {
    return this.request<{ message: string; updatedCount: number }>('/admin/comments/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, ids }),
    });
  }

  async deleteAdminComment(id: string) {
    return this.request<{ message: string }>(`/admin/comments/${id}`, {
      method: 'DELETE',
    });
  }

  // Generic HTTP methods for dynamic API calls
  async get<T = unknown>(endpoint: string) {
    return this.request<T>(endpoint);
  }

  async post<T = unknown>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T = unknown>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = unknown>(endpoint: string, body?: unknown) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = unknown>(endpoint: string) {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;