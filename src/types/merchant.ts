export interface MerchantPromotion {
  id: string;
  title: string;
  description: string;
  type: 'default' | 'common' | 'private';
  startDate: string;
  endDate: string;
  giftcodes: string;
  loginRequired: boolean;
  reviewRequired: boolean;
}


export interface MerchantSeo {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string | File;
  seoImage?: File;
  schemaType?: string;
  customSchema?: string;
  title?: string;
  description?: string;
  canonical?: string;
  schema?: string;
  image?: string;
}

export interface MerchantUtm {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  customParams?: string;
}

export interface MerchantScreenshots {
  images: File[];
  preview?: string;
}

export interface MerchantFaq {
  id: string;
  question: string;
  answer: string;
}

export interface MerchantFormData {
  // Basic info
  name: string;
  slug: string;
  description: string;
  category: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  logo: File | null;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';

  // Admin options
  isVerified: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  showInHomepage: boolean;
  displayOrder: number;
  hideReviews: boolean;
  hideWriteReview: boolean;

  // Promotions
  promotions: MerchantPromotion[];

  // SEO Configuration
  seo: MerchantSeo;

  // UTM Tracking
  utm: MerchantUtm;

  // Screenshots
  screenshots: MerchantScreenshots;

  // FAQs
  faqs: MerchantFaq[];
}

export interface AdminSettings {
  isVerified: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  showInHomepage: boolean;
  displayOrder: number;
}

export interface AdvertisementSettings {
  hideReviews: boolean;
  hideWriteReview: boolean;
}

export interface ScreenshotData {
  images: File[];
}

export interface SeoData {
  title: string;
  description: string;
  canonicalUrl: string;
  schemaType: string;
  seoImage: File | null;
}