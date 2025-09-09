export interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  avatar?: string;
  phone?: string;
  provider?: 'email' | 'google' | 'facebook' | 'apple';
  status?: 'active' | 'inactive' | 'suspended';
  isEmailVerified: boolean;
  lastLoginAt?: string;
  reviewCount?: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Merchant {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  status: 'recommended' | 'trusted' | 'neutral' | 'controversial' | 'avoid' | 'pending' | 'approved' | 'suspended' | 'rejected';
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  screenshots?: string[];
  allowComments: boolean;
  weeklyVisits?: number;
  hideAds: boolean;
  isStarred: boolean;
  reportCount: number;
  faq?: FAQ[];
  promotions?: Promotion[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  slug?: string;
  merchantId: string;
  userId?: string;
  displayName?: string;
  title: string;
  rating: number;
  content: string;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
  merchant?: Merchant;
  user?: User;
  comments?: ReviewComment[];
}

export interface ReviewComment {
  id: string;
  reviewId: string;
  userId?: string;
  displayName?: string;
  reaction: '❤️' | '😢' | '😡';
  content?: string;
  isReported: boolean;
  reportCount: number;
  status: 'published' | 'pending' | 'hidden';
  selectedReaction?: '❤️' | '😢' | '😡';
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: string;
  categoryId: string;
  allowComments?: boolean;
  hideAds?: boolean;
  status?: string;
  publishedAt?: string;
  readTime?: string;
  views?: number;
  likes?: number;
  shares?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MerchantsResponse {
  merchants: Merchant[];
  pagination: Pagination;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: Pagination;
}

export interface PostsResponse {
  posts: Post[];
  pagination: Pagination;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  code?: string;
  discount?: string;
  validUntil?: string;
  type: 'default' | 'priority';
  startDate?: string;
  endDate?: string;
  loginRequired: boolean;
  reviewRequired: boolean;
  giftCode?: {
    code: string;
    isActive: boolean;
    maxClaims: number;
    currentClaims: number;
    claimedBy: GiftCodeClaim[];
  };
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GiftCodeClaim {
  id: string;
  promotionId: string;
  userId?: string;
  userEmail?: string;
  displayName?: string;
  claimedAt: string;
  ipAddress?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  link: string;
  position: 'top' | 'sidebar' | 'bottom';
  active: boolean;
}