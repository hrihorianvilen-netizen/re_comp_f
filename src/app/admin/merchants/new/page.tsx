'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MerchantFormHeader from '@/components/admin/merchants/MerchantFormHeader';
import MerchantBasicInfo from '@/components/admin/merchants/MerchantBasicInfo';
import AdminOptions from '@/components/admin/merchants/AdminOptions';
import MerchantDefault from '@/components/admin/merchants/MerchantDefault';
import SeoConfiguration from '@/components/admin/merchants/SeoConfiguration';
import UtmTracking from '@/components/admin/merchants/UtmTracking';
import Screenshots from '@/components/admin/merchants/Screenshots';
import FAQ from '@/components/admin/merchants/FAQ';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { validateSlugFormat, autoGenerateSlug } from '@/lib/slug';
import type {
  MerchantFormData,
  MerchantPromotion,
  MerchantPromotePromotion,
  MerchantUtm,
  ScreenshotData,
  MerchantFaq
} from '@/types/merchant';

export default function AddMerchantPage() {
  const router = useRouter();
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [activeAction, setActiveAction] = useState<'discard' | 'save_draft' | 'publish' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<MerchantFormData>({
    // Basic info
    name: '',
    slug: '',
    description: '',
    category: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    logo: null,
    status: 'pending',

    // Admin options
    isVerified: false,
    isFeatured: false,
    isPopular: false,
    showInHomepage: false,
    displayOrder: 0,
    hideReviews: false,
    hideWriteReview: false,

    // Default promotion
    defaultPromotion: {
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumPurchase: '',
      expiryDate: '',
      termsConditions: '',
      link: ''
    },

    // Promote promotion
    promotePromotion: {
      isActive: false,
      title: '',
      description: '',
      discountText: '',
      validUntil: '',
      ctaText: 'Shop Now',
      ctaLink: '',
      backgroundColor: '#FFF3E0',
      textColor: '#E65100'
    },

    // SEO Configuration
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      schemaType: 'LocalBusiness',
      customSchema: ''
    },

    // UTM Tracking
    utm: {
      source: '',
      medium: '',
      campaign: '',
      term: '',
      content: '',
      customParams: ''
    },

    // Screenshots
    screenshots: {
      desktop: [],
      mobile: [],
      desktopPreview: '',
      mobilePreview: ''
    },

    // FAQs
    faqs: []
  });

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

  const handleAdminSettingsChange = (settings: {
    removeHotTrusted?: boolean;
    removeControversial?: boolean;
    removeAvoid?: boolean;
    controversialStartDate?: string;
    controversialEndDate?: string;
  } | undefined) => {
    if (settings) {
      // Map the settings to our form data structure
      setFormData(prev => ({
        ...prev,
        // These fields don't directly map, but we can store them in removeFromListUntil
        isVerified: settings.removeHotTrusted || prev.isVerified,
        isFeatured: settings.removeControversial || prev.isFeatured,
        isPopular: settings.removeAvoid || prev.isPopular
      }));
    }
  };

  const handleAdvertisementChange = (advertisement: {
    dontShowAds?: boolean;
    adsStartDate?: string;
    adsEndDate?: string;
  } | undefined) => {
    if (advertisement) {
      setFormData(prev => ({
        ...prev,
        hideReviews: advertisement.dontShowAds || false,
        hideWriteReview: advertisement.dontShowAds || false
      }));
    }
  };

  const handleDefaultPromotionChange = (promotion: MerchantPromotion) => {
    setFormData(prev => ({
      ...prev,
      defaultPromotion: promotion
    }));
  };

  const handlePromotePromotionChange = (promotion: MerchantPromotePromotion) => {
    setFormData(prev => ({
      ...prev,
      promotePromotion: promotion
    }));
  };

  const handleSeoChange = (seoData: {
    title: string;
    description: string;
    canonicalUrl: string;
    schemaType: string;
    seoImage: File | null;
  }) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        metaTitle: seoData.title,
        metaDescription: seoData.description,
        canonicalUrl: seoData.canonicalUrl,
        schemaType: seoData.schemaType,
        seoImage: seoData.seoImage || undefined,
        ogImage: seoData.seoImage || prev.seo.ogImage
      }
    }));
  };

  const handleUtmChange = (utmData: MerchantUtm) => {
    setFormData(prev => ({
      ...prev,
      utm: utmData
    }));
  };

  const handleScreenshotsChange = useCallback((screenshotsData: ScreenshotData) => {
    console.log('Parent received screenshots data:', {
      desktopImages: screenshotsData.desktopImages?.length || 0,
      mobileImages: screenshotsData.mobileImages?.length || 0,
      desktopFiles: screenshotsData.desktopImages?.map((f: File) => ({
        name: f?.name,
        size: f?.size,
        isFile: f instanceof File
      })),
      mobileFiles: screenshotsData.mobileImages?.map((f: File) => ({
        name: f?.name,
        size: f?.size,
        isFile: f instanceof File
      }))
    });

    // Update form data with the new screenshot files
    setFormData(prev => {
      const newState = {
        ...prev,
        screenshots: {
          desktop: screenshotsData.desktopImages || [], // Store all desktop images
          mobile: screenshotsData.mobileImages || [],   // Store all mobile images
          desktopPreview: prev.screenshots.desktopPreview,
          mobilePreview: prev.screenshots.mobilePreview
        }
      };

      console.log('Parent updating state with:', {
        desktop: newState.screenshots.desktop.length,
        mobile: newState.screenshots.mobile.length
      });

      return newState;
    });
  }, []);

  const handleFAQChange = (faqData: MerchantFaq[]) => {
    setFormData(prev => ({
      ...prev,
      faqs: faqData
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Merchant name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else {
      const slugValidation = validateSlugFormat(formData.slug);
      if (!slugValidation.isValid) {
        newErrors.slug = slugValidation.error || 'Invalid slug format';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.website.trim()) {
      newErrors.website = 'Website URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL starting with http:// or https://';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Logo is required for new merchants
    if (!formData.logo) {
      newErrors.logo = 'Logo image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (action: 'save_draft' | 'publish') => {
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setActiveAction(action);

    try {
      // Create FormData for multipart/form-data submission
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
      formDataToSend.append('status', action === 'publish' ? 'approved' : 'pending');

      // Add admin options
      formDataToSend.append('isVerified', formData.isVerified.toString());
      formDataToSend.append('isFeatured', formData.isFeatured.toString());
      formDataToSend.append('isPopular', formData.isPopular.toString());
      formDataToSend.append('showInHomepage', formData.showInHomepage.toString());
      formDataToSend.append('displayOrder', formData.displayOrder.toString());
      formDataToSend.append('hideReviews', formData.hideReviews.toString());
      formDataToSend.append('hideWriteReview', formData.hideWriteReview.toString());

      // Add default promotion (as JSON string)
      formDataToSend.append('defaultPromotion', JSON.stringify(formData.defaultPromotion));

      // Add promote promotion (as JSON string)
      formDataToSend.append('promotePromotion', JSON.stringify(formData.promotePromotion));

      // Add SEO configuration (as JSON string)
      formDataToSend.append('seo', JSON.stringify(formData.seo));
      // Add SEO image if provided - check for seoImage field from component
      const seoImageFile = formData.seo.seoImage || formData.seo.ogImage;
      if (seoImageFile && seoImageFile instanceof File) {
        formDataToSend.append('seoImage', seoImageFile);
      }

      // Add UTM tracking (as JSON string)
      formDataToSend.append('utm', JSON.stringify(formData.utm));

      // Add FAQs (as JSON string)
      formDataToSend.append('faqs', JSON.stringify(formData.faqs));

      // Add logo if exists
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      // Add screenshots if exist - handle arrays of files
      console.log('Screenshots to upload:', {
        desktop: formData.screenshots.desktop.length,
        mobile: formData.screenshots.mobile.length,
        desktopFiles: formData.screenshots.desktop,
        mobileFiles: formData.screenshots.mobile
      });

      // Additional debug logging
      console.log('FormData screenshots state:', formData.screenshots);

      // Debug: Check if files are File objects
      if (formData.screenshots.desktop.length > 0) {
        console.log('Desktop files check:', formData.screenshots.desktop.map((f, i) => ({
          index: i,
          isFile: f instanceof File,
          name: f?.name,
          size: f?.size,
          type: f?.type
        })));
      }

      if (formData.screenshots.mobile.length > 0) {
        console.log('Mobile files check:', formData.screenshots.mobile.map((f, i) => ({
          index: i,
          isFile: f instanceof File,
          name: f?.name,
          size: f?.size,
          type: f?.type
        })));
      }

      if (formData.screenshots.desktop.length > 0) {
        formData.screenshots.desktop.forEach((file, index) => {
          if (file instanceof File) {
            console.log(`Adding desktop screenshot ${index + 1}:`, file.name, file.size);
            formDataToSend.append('screenshotDesktop', file);
          } else {
            console.error(`Desktop file at index ${index} is not a File object:`, file);
          }
        });
      }
      if (formData.screenshots.mobile.length > 0) {
        formData.screenshots.mobile.forEach((file, index) => {
          if (file instanceof File) {
            console.log(`Adding mobile screenshot ${index + 1}:`, file.name, file.size);
            formDataToSend.append('screenshotMobile', file);
          } else {
            console.error(`Mobile file at index ${index} is not a File object:`, file);
          }
        });
      }

      // Debug: Log all FormData entries
      console.log('FormData entries being sent:');
      const entries = Array.from(formDataToSend.entries());
      let screenshotDesktopCount = 0;
      let screenshotMobileCount = 0;
      entries.forEach(([key, value]) => {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
          if (key === 'screenshotDesktop') screenshotDesktopCount++;
          if (key === 'screenshotMobile') screenshotMobileCount++;
        } else {
          console.log(`  ${key}: ${typeof value === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value}`);
        }
      });
      console.log(`Total screenshots in FormData: Desktop=${screenshotDesktopCount}, Mobile=${screenshotMobileCount}`);

      const result = await api.createAdminMerchant(formDataToSend);

      if (result.data) {
        toast.success(
          action === 'publish'
            ? 'Merchant published successfully!'
            : 'Merchant saved as draft!'
        );
        router.push('/admin/merchants');
      } else {
        setErrors({ general: result.error || 'Failed to create merchant' });
        toast.error(result.error || 'Failed to create merchant');
      }
    } catch (error) {
      console.error('Error creating merchant:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
      setActiveAction(null);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MerchantFormHeader
          activeAction={activeAction}
          setActiveAction={setActiveAction}
          onSaveDraft={() => handleSubmit('save_draft')}
          onPublish={() => handleSubmit('publish')}
          onDiscard={() => router.push('/admin/merchants')}
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
                onSettingsChange={handleAdminSettingsChange}
                onAdvertisementChange={handleAdvertisementChange}
              />
            </div>

            {/* Default & Promote Promotions - Full Width */}
            <div className="col-span-3">
              <MerchantDefault
                onDefaultChange={handleDefaultPromotionChange}
                onPromoteChange={handlePromotePromotionChange}
              />
            </div>

            {/* SEO Configuration and UTM Section */}
            <div className="col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* SEO Configuration - 2/3 width */}
              <div className="lg:col-span-2">
                <SeoConfiguration
                  onSeoChange={handleSeoChange}
                />
              </div>

              {/* UTM Tracking - 1/3 width */}
              <div className="lg:col-span-1">
                <UtmTracking
                  onUtmChange={handleUtmChange}
                />
              </div>
            </div>

            {/* Screenshots Section - Full Width */}
            <div className="col-span-3">
              <Screenshots
                onScreenshotsChange={handleScreenshotsChange}
              />
            </div>

            {/* FAQ Section - Full Width */}
            <div className="col-span-3">
              <FAQ
                onFAQChange={handleFAQChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}