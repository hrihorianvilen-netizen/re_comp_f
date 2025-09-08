export interface Merchant {
  id: string;
  slug: string;                    // Make required for SEO URLs
  name: string;
  logo?: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  status: 'recommended' | 'trusted' | 'controversial' | 'avoid' | 'neutral';
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  screenshots?: string[];
  promotions?: Promotion[];
  faq?: FAQ[];
  
  // NEW FRS required fields
  allowComments: boolean;          // For "Don't allow comments" setting
  hideAds: boolean;               // For "Don't show advertisements on my page"
  hideAdsUntil?: Date;            // Expiry date for hiding ads
  removeFromListUntil?: {         // Remove from specific lists until date
    controversial?: Date;
    trusted?: Date;
    avoid?: Date;
  };
  
  // Backoffice management fields
  isStarred: boolean;             // For "Recommended" tab logic
  reportCount: number;            // For "Controversial"/"Avoid" logic
  lastReportDate?: Date;          // Track negative trend
  
  createdAt: Date;
  updatedAt: Date;
}

// Admin-specific merchant type with different status values
export interface AdminMerchant {
  id: string;
  name: string;
  logo?: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  status: 'approved' | 'pending' | 'suspended' | 'rejected';
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  screenshots?: string[];
  promotions?: Promotion[];
  faq?: FAQ[];
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  admin: string;
  favorite: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  code?: string;
  discount?: string;
  validUntil?: Date;           // Keep for backward compatibility
  
  // NEW FRS required fields
  type: 'default' | 'priority';     // Priority vs default promotion
  startDate?: Date;                 // When promotion starts
  endDate?: Date;                   // When promotion expires
  
  // Gating requirements
  loginRequired: boolean;           // Require login to claim
  reviewRequired: boolean;          // Require 100+ char review to claim
  
  // Gift code system
  giftCode?: {
    code: string;
    isActive: boolean;
    maxClaims: number;
    currentClaims: number;
    claimedBy: GiftCodeClaim[];     // Track who claimed it
  };
  
  // Display settings
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Gift code claim tracking - NEW
export interface GiftCodeClaim {
  id: string;
  promotionId: string;
  userId?: string;
  userEmail?: string;
  displayName?: string;
  claimedAt: Date;
  ipAddress?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Review {
  id: string;
  slug?: string;
  merchantId: string;
  merchant?: Merchant;
  userId?: string;
  user?: User;
  displayName?: string;
  title: string;
  rating: number;
  content: string;
  helpful: number;
  notHelpful: number;
  comments?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  reviewId: string;
  review?: Review;
  userId?: string;
  user?: User;
  displayName?: string;
  title?: string;
  
  // UPDATED: FRS required reaction system
  reaction: '❤️' | '😢' | '😡';      // Required reaction selection
  content?: string;                  // Optional content (reaction only is allowed)
  
  // Tracking and moderation
  isReported: boolean;
  reportCount: number;
  status: 'published' | 'pending' | 'hidden';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  displayName?: string;           // For public display (defaults to "Anonymous")
  avatar?: string;
  phone?: string;
  
  // Authentication
  provider?: 'email' | 'google' | 'facebook' | 'apple';
  password?: string;              // Only for email provider
  
  // Account status and verification
  status: 'active' | 'inactive' | 'suspended';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  
  // Social login connections
  socialConnections?: {
    google?: { id: string; email: string; };
    facebook?: { id: string; email: string; };
    apple?: { id: string; email: string; };
  };
  
  // Activity and moderation
  lastLoginAt?: Date;
  suspendedUntil?: Date;
  suspendedReason?: string;
  reviewCount: number;
  commentCount: number;
  
  // Password reset
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  
  createdAt: Date;
  updatedAt: Date;
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

// Post (News/Tin-tuc) model - NEW
export interface Post {
  id: string;
  slug: string;          // p-[slug] URL용
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: string;
  categoryId: string;
  category?: Category;
  allowComments: boolean;
  hideAds: boolean;
  status: 'published' | 'draft' | 'trash';
  publishedAt?: Date;
  readTime?: string;
  views: number;
  likes: number;
  shares: number;
  comments?: PostComment[];
  createdAt: Date;
  updatedAt: Date;
}

// Category model for posts - NEW
export interface Category {
  id: string;
  slug: string;          // 카테고리 URL용
  name: string;
  description?: string;
  allowComments: boolean;
  hideAds: boolean;
  postCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Post comments (different from review comments) - NEW
export interface PostComment {
  id: string;
  postId: string;
  post?: Post;
  userId?: string;
  user?: User;
  displayName: string;
  content: string;
  reactions: {
    love: number;
    like: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  replies: PostReply[];
  createdAt: Date;
  updatedAt: Date;
}

// Post comment replies - NEW
export interface PostReply {
  id: string;
  commentId: string;
  userId?: string;
  user?: User;
  displayName: string;
  content: string;
  reactions: {
    love: number;
    like: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  createdAt: Date;
}

// Affiliate redirect tracking - NEW
export interface AffiliateRedirect {
  id: string;
  merchantId: string;
  merchant?: Merchant;
  slug: string;              // For /go/[slug] URLs
  targetUrl: string;
  clickCount: number;
  conversionCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Recently viewed tracking - NEW
export interface RecentlyViewed {
  id: string;
  userId?: string;
  sessionId?: string;        // For anonymous users
  merchantId: string;
  merchant?: Merchant;
  viewedAt: Date;
}

// Analytics event tracking - NEW
export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'merchant_click' | 'cta_click' | 'review_submit' | 'comment_submit' | 'giftcode_claim' | 'social_login';
  userId?: string;
  sessionId?: string;
  merchantId?: string;
  reviewId?: string;
  promotionId?: string;
  metadata?: Record<string, string | number | boolean>;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  createdAt: Date;
}