'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { getAssetUrl } from '@/lib/utils';
import MerchantFormHeader from '@/components/admin/merchants/MerchantFormHeader';
import MerchantBasicInfo from '@/components/admin/merchants/MerchantBasicInfo';
import MerchantDefault from '@/components/admin/merchants/MerchantDefault';
import AdminOptions from '@/components/admin/merchants/AdminOptions';
import SeoConfiguration from '@/components/admin/merchants/SeoConfiguration';
import UtmTracking from '@/components/admin/merchants/UtmTracking';
import Screenshots from '@/components/admin/merchants/Screenshots';
import FAQ from '@/components/admin/merchants/FAQ';
import { validateSlugFormat, autoGenerateSlug } from '@/lib/slug';

interface MerchantFormData {
  name: string;
  slug: string;
  description: string;
  category: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  logo: File | null;
  screenshots: FileList | null;
  status: 'draft' | 'recommended' | 'trusted' | 'neutral' | 'controversial' | 'avoid';
}

interface PromotionData {
  title?: string;
  description?: string;
  promoCode?: string;
  code?: string;
  discount?: string;
  startDate?: string;
  endDate?: string;
  validUntil?: string;
  conditions?: string;
  link?: string;
  loginRequired?: boolean;
  reviewRequired?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  type?: string;
  giftcodes?: string;
  giftCode?: Record<string, unknown>;
}

interface MerchantResponse {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  category?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  screenshots?: string[];
  status?: string;
  faq?: Array<{ id: string; question: string; answer: string }>;
  faqs?: Array<{ id: string; question: string; answer: string }>;
  seoTitle?: string;
  metaTitle?: string;
  seoDescription?: string;
  metaDescription?: string;
  seoImage?: string;
  canonicalUrl?: string;
  schemaType?: string;
  seo?: { image?: string; title?: string; description?: string; canonical?: string; schema?: string };
  removeFromListUntil?: {
    seo?: { image?: string; title?: string; description?: string; canonical?: string; schema?: string };
    [key: string]: unknown;
  };
  isVerified?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  showInHomepage?: boolean;
  displayOrder?: number;
  hideReviews?: boolean;
  hideWriteReview?: boolean;
  utmTargetUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  defaultPromotion?: PromotionData;
  promotePromotion?: PromotionData;
}

export default function MerchantEditPage() {
  const router = useRouter();
  const params = useParams();
  const merchantId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [activeAction, setActiveAction] = useState<'discard' | 'save_draft' | 'publish' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MerchantFormData>({
    name: '',
    slug: '',
    description: '',
    category: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    logo: null,
    screenshots: null,
    status: 'draft',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [seoData, setSeoData] = useState<{
    title?: string;
    description?: string;
    canonical?: string;
    schema?: string;
    image?: string | File;
  }>({
    title: '',
    description: '',
    canonical: '',
    schema: ''
  });

  // Admin Options state (separate for different needs)
  const [adminSettings, setAdminSettings] = useState({
    isVerified: false,
    isFeatured: false,
    isPopular: false,
    showInHomepage: false,
    displayOrder: 0,
    hideReviews: false,
    hideWriteReview: false
  });

  const [adminOptionsSettings, setAdminOptionsSettings] = useState({
    removeHotTrusted: false,
    removeControversial: false,
    removeAvoid: false,
    controversialStartDate: '',
    controversialEndDate: ''
  });

  const [adminOptionsAdvertisement, setAdminOptionsAdvertisement] = useState({
    dontShowAds: false,
    adsStartDate: '',
    adsEndDate: ''
  });

  // Default Promotions state
  const [defaultPromotion, setDefaultPromotion] = useState<PromotionData>({});
  const [promotePromotion, setPromotePromotion] = useState<PromotionData>({});

  // UTM state
  const [utmData, setUtmData] = useState({
    targetUrl: '',
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: ''
  });

  // Screenshots state
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [screenshotData, setScreenshotData] = useState<{ images: File[] }>({
    images: []
  });

  // FAQ state
  const [faqs, setFaqs] = useState<Array<{ id: string; question: string; answer: string }>>([]);

  useEffect(() => {
    const fetchMerchantData = async () => {
      setIsLoading(true);
      try {
        // Fetch specific merchant data from API
        const result = await api.getAdminMerchant(merchantId);
        
        if (result.data && result.data.merchant) {
          const merchant = result.data.merchant as MerchantResponse;
          
          console.log('Fetched merchant data:', merchant); // Debug log
          
          const merchantData: MerchantFormData = {
            name: merchant.name || '',
            slug: merchant.slug || '',
            description: merchant.description || '',
            category: merchant.category || '',
            website: merchant.website || '',
            email: merchant.email || '',
            phone: merchant.phone || '',
            address: merchant.address || '',
            logo: null,
            screenshots: null,
            status: (merchant.status as MerchantFormData['status']) || 'neutral',
          };
          
          console.log('Setting form data:', merchantData); // Debug log
          
          setFormData(merchantData);

          // Set logo preview if exists
          if (merchant.logo) {
            setLogoPreview(getAssetUrl(merchant.logo));
          }

          // Set SEO data if exists
          // Check for SEO data in various possible locations
          const seoTitle = merchant.seoTitle || merchant.metaTitle || '';
          const seoDescription = merchant.seoDescription || merchant.metaDescription || '';
          const canonical = merchant.canonicalUrl || '';
          const schema = merchant.schemaType || '';

          // Get SEO image from merchant data or from JSON field
          const seoImage = merchant.seoImage ||
                          merchant.seo?.image ||
                          merchant.removeFromListUntil?.seo?.image || '';

          if (seoTitle || seoDescription || canonical || schema || seoImage) {
            setSeoData({
              title: seoTitle,
              description: seoDescription,
              canonical: canonical,
              schema: schema,
              image: seoImage
            });
          }

          // Set admin options if exists
          if (merchant.isVerified !== undefined || merchant.isFeatured !== undefined) {
            setAdminSettings({
              isVerified: merchant.isVerified || false,
              isFeatured: merchant.isFeatured || false,
              isPopular: merchant.isPopular || false,
              showInHomepage: merchant.showInHomepage || false,
              displayOrder: merchant.displayOrder || 0,
              hideReviews: merchant.hideReviews || false,
              hideWriteReview: merchant.hideWriteReview || false
            });
          }

          // Set UTM data if exists
          if (merchant.utmSource || merchant.utmMedium) {
            setUtmData({
              targetUrl: merchant.utmTargetUrl || '',
              source: merchant.utmSource || '',
              medium: merchant.utmMedium || '',
              campaign: merchant.utmCampaign || '',
              term: merchant.utmTerm || '',
              content: merchant.utmContent || ''
            });
          }

          // Set screenshots if exists
          if (merchant.screenshots) {
            setScreenshots(merchant.screenshots);
          }

          // Set FAQs if exists
          if (merchant.faq) {
            setFaqs(merchant.faq);
          } else if (merchant.faqs) {
            setFaqs(merchant.faqs);
          }

          // Set promotions if exists
          console.log(merchant.defaultPromotion, "sdf");
          
          if (merchant.defaultPromotion) {
            setDefaultPromotion(merchant.defaultPromotion);
          }
          if (merchant.promotePromotion) {
            setPromotePromotion(merchant.promotePromotion);
          }
        } else {
          console.error('Merchant not found:', result.error);
          router.push('/admin/merchants');
        }
      } catch (error) {
        console.error('Error fetching merchant:', error);
        router.push('/admin/merchants');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerchantData();
  }, [merchantId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug when merchant name changes (only if slug is empty or matches previous auto-generated slug)
    if (name === 'name' && value.trim()) {
      const currentSlug = formData.slug;
      const previousAutoSlug = autoGenerateSlug(formData.name);

      // Only auto-generate if slug is empty or if it was previously auto-generated
      if (!currentSlug || currentSlug === previousAutoSlug) {
        const newSlug = autoGenerateSlug(value);
        setFormData(prev => ({
          ...prev,
          name: value,
          slug: newSlug
        }));
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLogoChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, logo: file }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Merchant name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    else {
      const slugValidation = validateSlugFormat(formData.slug);
      if (!slugValidation.isValid) {
        newErrors.slug = slugValidation.error || 'Invalid slug format';
      }
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!formData.email.includes('@')) newErrors.email = 'Email is invalid';
    
    // Logo is required - either existing preview or new upload
    if (!formData.logo && !logoPreview) {
      newErrors.logo = 'Logo image is required';
    }
    
    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (action: 'save_draft' | 'publish') => {
    if (!validateForm() || isSubmitting) return;
    
    setIsSubmitting(true);
    setActiveAction(action);
    
    try {
      const formDataToSend = new FormData();
      
      // Add basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      
      // Add status based on action
      const status = action === 'publish' ? 'recommended' : 'draft';
      formDataToSend.append('status', status);

      // Add SEO data
      if (seoData.title) formDataToSend.append('seoTitle', seoData.title);
      if (seoData.description) formDataToSend.append('seoDescription', seoData.description);
      if (seoData.canonical) formDataToSend.append('canonicalUrl', seoData.canonical);
      if (seoData.schema) formDataToSend.append('schemaType', seoData.schema);

      // Handle SEO image - only append as file if it's a File object
      if (seoData.image) {
        if (seoData.image instanceof File) {
          formDataToSend.append('seoImage', seoData.image);
        } else if (typeof seoData.image === 'string') {
          // If it's a string URL, send it as a regular field so backend knows to keep it
          formDataToSend.append('existingSeoImage', seoData.image);
        }
      }

      // Add admin options
      formDataToSend.append('isVerified', String(adminSettings.isVerified));
      formDataToSend.append('isFeatured', String(adminSettings.isFeatured));
      formDataToSend.append('isPopular', String(adminSettings.isPopular));
      formDataToSend.append('showInHomepage', String(adminSettings.showInHomepage));
      formDataToSend.append('displayOrder', String(adminSettings.displayOrder));
      formDataToSend.append('hideReviews', String(adminSettings.hideReviews));
      formDataToSend.append('hideWriteReview', String(adminSettings.hideWriteReview));

      // Add UTM data
      if (utmData.targetUrl) formDataToSend.append('utm[targetUrl]', utmData.targetUrl);
      if (utmData.source) formDataToSend.append('utm[source]', utmData.source);
      if (utmData.medium) formDataToSend.append('utm[medium]', utmData.medium);
      if (utmData.campaign) formDataToSend.append('utm[campaign]', utmData.campaign);
      if (utmData.term) formDataToSend.append('utm[term]', utmData.term);
      if (utmData.content) formDataToSend.append('utm[content]', utmData.content);

      // Add FAQs
      if (faqs && faqs.length > 0) {
        formDataToSend.append('faqs', JSON.stringify(faqs));
      }

      // Add default promotion
      if (Object.keys(defaultPromotion).length > 0) {
        formDataToSend.append('defaultPromotion', JSON.stringify(defaultPromotion));
      }

      // Add promote promotion
      if (Object.keys(promotePromotion).length > 0) {
        formDataToSend.append('promotePromotion', JSON.stringify(promotePromotion));
      }

      // Add screenshots
      screenshotData.images.forEach((file, index) => {
        formDataToSend.append(`screenshots_${index}`, file);
      });
      
      // Add logo if present
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }
      
      // Add screenshots if present
      if (formData.screenshots) {
        Array.from(formData.screenshots).forEach((file) => {
          formDataToSend.append('desktopScreenshots', file);
        });
      }
      
      const result = await api.updateAdminMerchant(merchantId, formDataToSend);
      
      if (result.data) {
        router.push('/admin/merchants');
      } else {
        setErrors({ general: result.error || 'Failed to update merchant' });
      }
    } catch {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setActiveAction(null);
    }
  };

  const handleDiscard = () => {
    if (confirm('Are you sure you want to discard all changes?')) {
      router.push('/admin/merchants');
    }
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 relative">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000080]">
          <div className="rounded-lg p-6 flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white font-medium">
              {activeAction === 'save_draft' ? 'Saving draft...' :
               activeAction === 'publish' ? 'Publishing...' :
               'Saving...'}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MerchantFormHeader
          activeAction={activeAction}
          setActiveAction={setActiveAction}
          onSaveDraft={() => handleSubmit('save_draft')}
          onPublish={() => handleSubmit('publish')}
          onDiscard={handleDiscard}
          isSubmitting={isSubmitting}
        />

        {/* Error Display */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="text-red-800 text-sm">
              {errors.general}
            </div>
          </div>
        )}

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Information Section - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              <MerchantBasicInfo 
                formData={formData}
                errors={errors}
                logoPreview={logoPreview}
                setLogoPreview={setLogoPreview}
                onInputChange={handleInputChange}
                onLogoChange={handleLogoChange}
              />
            </div>

            {/* Right sidebar - 1/3 width */}
            <div className="lg:col-span-1">
              <AdminOptions
                settings={adminOptionsSettings}
                advertisement={adminOptionsAdvertisement}
                onSettingsChange={(settings) => setAdminOptionsSettings(prev => ({ ...prev, ...settings }))}
                onAdvertisementChange={(advertisement) => setAdminOptionsAdvertisement(prev => ({ ...prev, ...advertisement }))}
              />
            </div>
            <div className="col-span-3">
              <MerchantDefault
                initialDefaultPromotion={
                  defaultPromotion.title || defaultPromotion.description
                    ? {
                        title: defaultPromotion.title || '',
                        description: defaultPromotion.description || ''
                      }
                    : undefined
                }
                initialPromotePromotion={
                  promotePromotion.title || promotePromotion.description
                    ? {
                        title: promotePromotion.title || '',
                        description: promotePromotion.description || '',
                        type: promotePromotion.type || '',
                        startDate: promotePromotion.startDate || '',
                        endDate: promotePromotion.endDate || '',
                        giftcodes: promotePromotion.giftcodes || '',
                        loginRequired: Boolean(promotePromotion.loginRequired),
                        reviewRequired: Boolean(promotePromotion.reviewRequired)
                      }
                    : undefined
                }
                onDefaultChange={(data) => setDefaultPromotion({...defaultPromotion, ...data})}
                onPromoteChange={(data) => setPromotePromotion({...promotePromotion, ...data})}
              />
            </div>
            
            {/* SEO Configuration and UTM Section */}
            <div className="col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* SEO Configuration - 2/3 width */}
              <div className="lg:col-span-2">
                <SeoConfiguration
                  initialSeo={seoData}
                  onSeoChange={(data) => {
                    setSeoData({
                      title: data.title,
                      description: data.description,
                      canonical: data.canonicalUrl,
                      schema: data.schemaType,
                      image: data.seoImage || undefined
                    });
                  }}
                />
              </div>
              
              {/* UTM Tracking - 1/3 width */}
              <div className="lg:col-span-1">
                <UtmTracking
                  initialUtm={utmData}
                  onUtmChange={(data) => setUtmData(data)}
                />
              </div>
            </div>

            {/* Screenshots Section - Full Width */}
            <div className="col-span-3">
              <Screenshots
                initialScreenshots={screenshots}
                onScreenshotsChange={(data) => setScreenshotData(data)}
              />
            </div>

            {/* FAQ Section - Full Width */}
            <div className="col-span-3">
              <FAQ
                initialFaqs={faqs}
                onFAQChange={(data) => setFaqs(data)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}