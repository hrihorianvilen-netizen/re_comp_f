'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import MerchantFormHeader from '@/components/admin/merchants/MerchantFormHeader';
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
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
}

export default function AddMerchantPage() {
  const router = useRouter();
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [activeAction, setActiveAction] = useState<'discard' | 'save_draft' | 'publish' | null>(null);
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
    status: 'pending',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    
    // Logo is required for new merchants
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
      const status = action === 'publish' ? 'recommended' : 'draft';
      formDataToSend.append('status', status);
      
      // Add isDraft flag for backend to understand the workflow state
      const isDraft = action === 'save_draft';
      formDataToSend.append('isDraft', isDraft.toString());
      
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
      
      const result = await api.createAdminMerchant(formDataToSend);
      
      if (result.data) {
        router.push('/admin/merchants');
      } else {
        setErrors({ general: result.error || 'Failed to create merchant' });
      }
    } catch {
      setErrors({ general: 'Network error. Please try again.' });
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
                onSettingsChange={(settings) => console.log('Settings changed:', settings)}
                onAdvertisementChange={(advertisement) => console.log('Advertisement changed:', advertisement)}
              />
            </div>
            <div className="col-span-3">
              <MerchantDefault 
                onDefaultChange={(data) => console.log('Default promotion changed:', data)}
                onPromoteChange={(data) => console.log('Promote promotion changed:', data)}
              />
            </div>
            
            {/* SEO Configuration and UTM Section */}
            <div className="col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            <div className="col-span-3">
              <Screenshots 
                onScreenshotsChange={(data) => console.log('Screenshots changed:', data)}
              />
            </div>

            {/* FAQ Section - Full Width */}
            <div className="col-span-3">
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