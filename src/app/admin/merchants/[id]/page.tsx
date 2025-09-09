'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { getAssetUrl } from '@/lib/utils';
import MerchantDetailHeader from '@/components/admin/merchants/MerchantDetailHeader';
import MerchantBasicInfo from '@/components/admin/merchants/MerchantBasicInfo';
import MerchantDefault from '@/components/admin/merchants/MerchantDefault';
import AdminOptions from '@/components/admin/merchants/AdminOptions';
import SeoConfiguration from '@/components/admin/merchants/SeoConfiguration';
import UtmTracking from '@/components/admin/merchants/UtmTracking';
import Screenshots from '@/components/admin/merchants/Screenshots';
import FAQ from '@/components/admin/merchants/FAQ';

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

export default function MerchantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const merchantId = params.id as string;
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
          const merchant = result.data.merchant;

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

  const handleSaveClick = async () => {
    if (!validateForm()) return;

    try {
      // Simulate API call to save changes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Saving merchant data:', formData);
      
      // Update original data with new saved data
      setOriginalData(formData);
      setIsEditMode(false);
      
      // Show success message (you can implement a toast notification here)
      console.log('Merchant updated successfully');
    } catch (error) {
      console.error('Error saving merchant:', error);
    }
  };

  const handleDiscardClick = () => {
    if (confirm('Are you sure you want to discard all changes?')) {
      router.push('/admin/merchants');
    }
  };

  const handleSaveDraftClick = async () => {
    // Save as draft logic
    if (!validateForm()) return;
    
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
      formDataToSend.append('status', 'draft');
      
      // Add logo if present
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }
      
      const result = await api.updateAdminMerchant(merchantId, formDataToSend);
      
      if (result.data) {
        setOriginalData(formData);
        setIsEditMode(false);
        // You could show a success toast here
      } else {
        console.error('Failed to save draft:', result.error);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handlePublishClick = async () => {
    if (!validateForm()) return;
    
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
      formDataToSend.append('status', 'recommended');
      
      // Add logo if present
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }
      
      const result = await api.updateAdminMerchant(merchantId, formDataToSend);
      
      if (result.data) {
        const updatedData = { ...formData, status: 'recommended' as const };
        setFormData(updatedData);
        setOriginalData(updatedData);
        setIsEditMode(false);
        // You could show a success toast here
      } else {
        console.error('Failed to publish:', result.error);
      }
    } catch (error) {
      console.error('Error publishing merchant:', error);
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
                  onSettingsChange={(settings) => console.log('Settings changed:', settings)}
                  onAdvertisementChange={(advertisement) => console.log('Advertisement changed:', advertisement)}
                />
              </div>
            </div>

            {/* MerchantDefault - Full width */}
            <div className={`col-span-3 ${!isEditMode ? 'pointer-events-none opacity-75' : ''}`}>
              <MerchantDefault 
                onDefaultChange={(data) => console.log('Default promotion changed:', data)}
                onPromoteChange={(data) => console.log('Promote promotion changed:', data)}
              />
            </div>
            
            {/* SEO Configuration and UTM Section */}
            <div className={`col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-8 ${!isEditMode ? 'pointer-events-none opacity-75' : ''}`}>
              {/* SEO Configuration - 2/3 width */}
              <div className="lg:col-span-2">
                <SeoConfiguration 
                  onSeoChange={(data) => console.log('SEO data changed:', data)}
                />
              </div>
              
              {/* UTM Tracking - 1/3 width */}
              <div className="lg:col-span-1">
                <UtmTracking 
                  onUtmChange={(data) => console.log('UTM data changed:', data)}
                />
              </div>
            </div>

            {/* Screenshots Section - Full Width */}
            <div className={`col-span-3 ${!isEditMode ? 'pointer-events-none opacity-75' : ''}`}>
              <Screenshots 
                onScreenshotsChange={(data) => console.log('Screenshots changed:', data)}
              />
            </div>

            {/* FAQ Section - Full Width */}
            <div className={`col-span-3 ${!isEditMode ? 'pointer-events-none opacity-75' : ''}`}>
              <FAQ 
                onFAQChange={(data) => console.log('FAQ changed:', data)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}