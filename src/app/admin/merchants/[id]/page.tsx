'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { getAssetUrl } from '@/lib/utils';
import toast from 'react-hot-toast';
import MerchantDetailHeader from '@/components/admin/merchants/MerchantDetailHeader';
import MerchantBasicInfo from '@/components/admin/merchants/MerchantBasicInfo';
import MerchantDefault from '@/components/admin/merchants/MerchantDefault';
import AdminOptions from '@/components/admin/merchants/AdminOptions';
import SeoConfiguration from '@/components/admin/merchants/SeoConfiguration';
import UtmTracking from '@/components/admin/merchants/UtmTracking';
import Screenshots from '@/components/admin/merchants/Screenshots';
import FAQ from '@/components/admin/merchants/FAQ';

interface Merchant {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  screenshots?: string[];
  status: 'recommended' | 'trusted' | 'neutral' | 'controversial' | 'avoid' | 'pending' | 'approved' | 'suspended' | 'rejected' | 'draft';
  hideAds?: boolean;
  hideAdsUntil?: string | Date;
  removeFromListUntil?: Record<string, unknown> | null;
  promotions?: Array<{
    type: string;
    title: string;
    description: string;
    loginRequired: boolean;
    reviewRequired: boolean;
    startDate?: string;
    endDate?: string;
    giftCode?: {
      codes: string[];
    };
  }>;
  seo?: {
    title?: string;
    description?: string;
    canonical?: string;
    schema?: string;
  };
  utm?: {
    targetUrl?: string;
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  faqs?: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
}

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
  status: 'recommended' | 'trusted' | 'neutral' | 'controversial' | 'avoid' | 'pending' | 'approved' | 'suspended' | 'rejected' | 'draft';
}

interface MerchantSettings {
  removeFromList?: {
    hotTrusted?: boolean;
    controversial?: boolean;
    avoid?: boolean;
  } | null;
  hideAdsUntil?: string;
  dontShowAds?: boolean;
}

interface AdminOptionsSettings {
  removeHotTrusted?: boolean;
  removeControversial?: boolean;
  removeAvoid?: boolean;
  controversialStartDate?: string;
  controversialEndDate?: string;
}

interface AdminOptionsAdvertisement {
  dontShowAds?: boolean;
  adsStartDate?: string;
  adsEndDate?: string;
}

interface MerchantPromotion {
  title?: string;
  description?: string;
  loginRequired?: boolean;
  reviewRequired?: boolean;
  startDate?: string;
  endDate?: string;
  giftCodes?: string;
}

interface MerchantSeo {
  title?: string;
  description?: string;
  canonical?: string;
  schema?: string;
}

interface MerchantUtm {
  targetUrl?: string;
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
}

export default function MerchantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const merchantId = params.id as string;

  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
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
    status: 'neutral',
  });

  const [settings, setSettings] = useState<MerchantSettings>({});
  const [adminOptionsSettings, setAdminOptionsSettings] = useState<AdminOptionsSettings>({});
  const [adminOptionsAdvertisement, setAdminOptionsAdvertisement] = useState<AdminOptionsAdvertisement>({});
  const [defaultPromotion, setDefaultPromotion] = useState<MerchantPromotion>({});
  const [priorityPromotion, setPriorityPromotion] = useState<MerchantPromotion>({});
  const [seo, setSeo] = useState<MerchantSeo>({});
  const [utm, setUtm] = useState<MerchantUtm>({});
  const [faqs, setFaqs] = useState<Array<{ id: string; question: string; answer: string }>>([]);

  const [originalData, setOriginalData] = useState<MerchantFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if merchant is in draft/pending status
  const isDraft = formData.status === 'pending' || formData.status === 'draft';

  useEffect(() => {
    const fetchMerchantData = async () => {
      setIsLoading(true);
      try {
        // Fetch specific merchant data from API
        const result = await api.getAdminMerchant(merchantId);

        if (result.data && result.data.merchant) {
          const merchant = result.data.merchant as Merchant;

          const allowedStatuses: MerchantFormData['status'][] = [
            'recommended',
            'trusted',
            'neutral',
            'controversial',
            'avoid',
            'pending', 'approved', 'suspended', 'rejected', 'draft'
          ];

          const safeStatus: MerchantFormData['status'] = allowedStatuses.includes(
            merchant.status as MerchantFormData['status']
          )
            ? (merchant.status as MerchantFormData['status'])
            : 'neutral';

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
            status: safeStatus,
          };

          setFormData(merchantData);
          setOriginalData(merchantData);

          // Set additional data - safely map fields that might exist
          setSettings({
            dontShowAds: merchant.hideAds || false,
            hideAdsUntil: merchant.hideAdsUntil as string | undefined,
            removeFromList: merchant.removeFromListUntil || undefined
          });

          // Map to AdminOptions format
          setAdminOptionsAdvertisement({
            dontShowAds: merchant.hideAds || false,
            adsStartDate: merchant.hideAdsUntil as string | undefined,
            adsEndDate: undefined
          });

          // Initialize admin options settings (these might come from removeFromListUntil or other fields)
          setAdminOptionsSettings({
            removeHotTrusted: false,
            removeControversial: false,
            removeAvoid: false
          });

          // These might be nested objects or need to be constructed from fields
          if (merchant.seo) setSeo(merchant.seo);
          if (merchant.utm) setUtm(merchant.utm);
          if (merchant.faqs) setFaqs(merchant.faqs);

          // Set promotions
          if (merchant.promotions) {
            const defaultProm = merchant.promotions.find((p) => p.type === 'default');
            const priorityProm = merchant.promotions.find((p) => p.type === 'priority');

            if (defaultProm) {
              setDefaultPromotion({
                title: defaultProm.title,
                description: defaultProm.description,
                loginRequired: defaultProm.loginRequired,
                reviewRequired: defaultProm.reviewRequired
              });
            }

            if (priorityProm) {
              setPriorityPromotion({
                title: priorityProm.title,
                description: priorityProm.description,
                loginRequired: priorityProm.loginRequired,
                reviewRequired: priorityProm.reviewRequired,
                startDate: priorityProm.startDate,
                endDate: priorityProm.endDate,
                giftCodes: priorityProm.giftCode?.codes?.join(';')
              });
            }
          }

          // If merchant is draft/pending, automatically enable edit mode
          if (merchant.status === 'pending' || merchant.status === 'draft') {
            setIsEditMode(true);
          }

          // Set logo preview if exists
          if (merchant.logo) {
            setLogoPreview(getAssetUrl(merchant.logo));
          }
        } else {
          console.error('Merchant not found:', result.error);
          toast.error('Merchant not found');
          router.push('/admin/merchants');
        }
      } catch (error) {
        console.error('Error fetching merchant:', error);
        toast.error('Failed to load merchant data');
        router.push('/admin/merchants');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerchantData();
  }, [merchantId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!isEditMode) return;

    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLogoChange = (file: File | null) => {
    if (!isEditMode) return;
    setFormData(prev => ({ ...prev, logo: file }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Merchant name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
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

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    // Restore original data
    if (originalData) {
      setFormData(originalData);
    }
    setIsEditMode(false);
    setErrors({});
  };

  const prepareFormData = (status: string) => {
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
    formDataToSend.append('status', status);

    // Add logo if present
    if (formData.logo) {
      formDataToSend.append('logo', formData.logo);
    }

    // Add promotions
    if (defaultPromotion.title) {
      formDataToSend.append('defaultPromotion[title]', defaultPromotion.title);
      formDataToSend.append('defaultPromotion[description]', defaultPromotion.description || '');
      formDataToSend.append('defaultPromotion[loginRequired]', String(defaultPromotion.loginRequired || false));
      formDataToSend.append('defaultPromotion[reviewRequired]', String(defaultPromotion.reviewRequired || false));
    }

    if (priorityPromotion.title) {
      formDataToSend.append('priorityPromotion[title]', priorityPromotion.title);
      formDataToSend.append('priorityPromotion[description]', priorityPromotion.description || '');
      formDataToSend.append('priorityPromotion[loginRequired]', String(priorityPromotion.loginRequired || false));
      formDataToSend.append('priorityPromotion[reviewRequired]', String(priorityPromotion.reviewRequired || false));
      if (priorityPromotion.startDate) formDataToSend.append('priorityPromotion[startDate]', priorityPromotion.startDate);
      if (priorityPromotion.endDate) formDataToSend.append('priorityPromotion[endDate]', priorityPromotion.endDate);
      if (priorityPromotion.giftCodes) formDataToSend.append('priorityPromotion[giftCodes]', priorityPromotion.giftCodes);
    }

    // Add SEO
    if (seo.title) formDataToSend.append('seo[title]', seo.title);
    if (seo.description) formDataToSend.append('seo[description]', seo.description);
    if (seo.canonical) formDataToSend.append('seo[canonical]', seo.canonical);
    if (seo.schema) formDataToSend.append('seo[schema]', seo.schema);

    // Add UTM
    if (utm.targetUrl) formDataToSend.append('utm[targetUrl]', utm.targetUrl);
    if (utm.source) formDataToSend.append('utm[source]', utm.source);
    if (utm.medium) formDataToSend.append('utm[medium]', utm.medium);
    if (utm.campaign) formDataToSend.append('utm[campaign]', utm.campaign);
    if (utm.content) formDataToSend.append('utm[content]', utm.content);
    if (utm.term) formDataToSend.append('utm[term]', utm.term);

    // Add settings
    if (settings.dontShowAds !== undefined) {
      formDataToSend.append('settings[dontShowAds]', String(settings.dontShowAds));
    }
    if (settings.hideAdsUntil) {
      formDataToSend.append('settings[hideAdsUntil]', settings.hideAdsUntil);
    }
    if (settings.removeFromList) {
      formDataToSend.append('settings[removeFromList]', JSON.stringify(settings.removeFromList));
    }

    // Add FAQs
    if (faqs && faqs.length > 0) {
      formDataToSend.append('faqs', JSON.stringify(faqs));
    }

    return formDataToSend;
  };

  const handleSaveClick = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const formDataToSend = prepareFormData(formData.status);
      const result = await api.updateAdminMerchant(merchantId, formDataToSend);

      if (result.data) {
        // Update original data with new saved data
        setOriginalData(formData);
        setIsEditMode(false);
        toast.success('Merchant updated successfully!');
      } else {
        console.error('Failed to save merchant:', result.error);
        toast.error(result.error || 'Failed to save merchant');
      }
    } catch (error) {
      console.error('Error saving merchant:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardClick = () => {
    if (confirm('Are you sure you want to discard all changes?')) {
      router.push('/admin/merchants');
    }
  };

  const handleSaveDraftClick = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const formDataToSend = prepareFormData('draft');
      const result = await api.updateAdminMerchant(merchantId, formDataToSend);

      if (result.data) {
        const updatedData = { ...formData, status: 'draft' as const };
        setFormData(updatedData);
        setOriginalData(updatedData);
        setIsEditMode(false);
        toast.success('Merchant saved as draft!');
      } else {
        console.error('Failed to save draft:', result.error);
        toast.error(result.error || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('An error occurred while saving draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishClick = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const formDataToSend = prepareFormData('recommended');
      const result = await api.updateAdminMerchant(merchantId, formDataToSend);

      if (result.data) {
        const updatedData = { ...formData, status: 'recommended' as const };
        setFormData(updatedData);
        setOriginalData(updatedData);
        setIsEditMode(false);
        toast.success('Merchant published successfully!');
      } else {
        console.error('Failed to publish:', result.error);
        toast.error(result.error || 'Failed to publish merchant');
      }
    } catch (error) {
      console.error('Error publishing merchant:', error);
      toast.error('An error occurred while publishing');
    } finally {
      setIsSaving(false);
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
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MerchantDetailHeader
          isEditMode={isEditMode}
          isDraft={isDraft}
          merchantName={formData.name}
          merchantStatus={formData.status}
          onEditClick={handleEditClick}
          onSaveClick={handleSaveClick}
          onCancelClick={handleCancelClick}
          onDiscardClick={handleDiscardClick}
          onSaveDraftClick={handleSaveDraftClick}
          onPublishClick={handlePublishClick}
          isSaving={isSaving}
        />

        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Information Section - 2/3 width */}
            <div className="lg:col-span-2 space-y-8">
              <div className={!isEditMode ? 'pointer-events-none opacity-75' : ''}>
                <MerchantBasicInfo
                  formData={formData}
                  errors={errors}
                  logoPreview={logoPreview}
                  setLogoPreview={setLogoPreview}
                  onInputChange={handleInputChange}
                  onLogoChange={handleLogoChange}
                  disabled={!isEditMode}
                />
              </div>
            </div>

            {/* Right sidebar - 1/3 width */}
            <div className="lg:col-span-1">
              <div className={!isEditMode ? 'pointer-events-none opacity-75' : ''}>
                <AdminOptions
                  settings={adminOptionsSettings}
                  advertisement={adminOptionsAdvertisement}
                  onSettingsChange={(newSettings) => {
                    setAdminOptionsSettings(newSettings || {});
                    // Update main settings if needed
                  }}
                  onAdvertisementChange={(newAdvertisement) => {
                    setAdminOptionsAdvertisement(newAdvertisement || {});
                    // Update main settings
                    if (newAdvertisement) {
                      setSettings(prev => ({
                        ...prev,
                        dontShowAds: newAdvertisement.dontShowAds,
                        hideAdsUntil: newAdvertisement.adsStartDate
                      }));
                    }
                  }}
                />
              </div>
            </div>

            {/* MerchantDefault - Full width */}
            <div className={`col-span-3 ${!isEditMode ? 'pointer-events-none opacity-75' : ''}`}>
              <MerchantDefault
                onDefaultChange={(data) => {
                  setDefaultPromotion({
                    title: data.title,
                    description: data.description
                  });
                }}
                onPromoteChange={(data) => {
                  setPriorityPromotion({
                    title: data.title,
                    description: data.description,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    giftCodes: data.giftcodes,
                    loginRequired: data.loginRequired,
                    reviewRequired: data.reviewRequired
                  });
                }}
              />
            </div>

            {/* SEO Configuration and UTM Section */}
            <div className={`col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-8 ${!isEditMode ? 'pointer-events-none opacity-75' : ''}`}>
              {/* SEO Configuration - 2/3 width */}
              <div className="lg:col-span-2">
                <SeoConfiguration
                  onSeoChange={(data) => {
                    setSeo({
                      title: data.title,
                      description: data.description,
                      canonical: data.canonicalUrl,
                      schema: data.schemaType
                    });
                  }}
                />
              </div>

              {/* UTM Tracking - 1/3 width */}
              <div className="lg:col-span-1">
                <UtmTracking
                  onUtmChange={(data) => {
                    setUtm({
                      targetUrl: data.targetUrl,
                      source: data.source,
                      medium: data.medium,
                      campaign: data.campaign,
                      content: data.content,
                      term: data.term
                    });
                  }}
                />
              </div>
            </div>

            {/* Screenshots Section - Full Width */}
            <div className={`col-span-3 ${!isEditMode ? 'pointer-events-none opacity-75' : ''}`}>
              <Screenshots
                onScreenshotsChange={(data) => {
                  // Screenshots handling would go here if needed
                  // Currently not used in the form submission
                  console.log('Screenshots data:', data);
                }}
              />
            </div>

            {/* FAQ Section - Full Width */}
            <div className={`col-span-3 ${!isEditMode ? 'pointer-events-none opacity-75' : ''}`}>
              <FAQ
                onFAQChange={(data) => {
                  setFaqs(data);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}