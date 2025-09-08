export interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;
  avatar?: string;
  phone?: string;
  provider?: string;
  status?: string;
  isEmailVerified?: boolean;
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
  status: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  screenshots?: string[];
  allowComments?: boolean;
  weeklyVisits?: number;
  hideAds?: boolean;
  isStarred?: boolean;
  reportCount?: number;
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
  helpful?: number;
  notHelpful?: number;
  createdAt: string;
  updatedAt: string;
  merchant?: Merchant;
  user?: User;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  reviewId: string;
  userId?: string;
  displayName?: string;
  reaction: '❤️' | '😢' | '😡';
  content?: string;
  isReported?: boolean;
  reportCount?: number;
  status?: string;
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