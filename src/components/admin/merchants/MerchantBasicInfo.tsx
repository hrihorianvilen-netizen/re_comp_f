'use client';

import LogoUpload from './LogoUpload';

interface MerchantFormData {
  name: string;
  slug: string;
  description: string;
  category?: string;
  website: string;
  email?: string;
  phone?: string;
  address?: string;
  logo: File | null;
}

interface MerchantBasicInfoProps {
  formData: MerchantFormData;
  errors: Record<string, string>;
  logoPreview: string;
  setLogoPreview: (preview: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLogoChange: (file: File | null) => void;
  disabled?: boolean;
}

export default function MerchantBasicInfo({
  formData,
  errors,
  logoPreview,
  setLogoPreview,
  onInputChange,
  onLogoChange,
}: MerchantBasicInfoProps) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Information</h3>
      </div>
      <div className="px-6 py-4 space-y-6">
        {/* Logo and Name/Slug section */}
        <div className="flex gap-6">
          <LogoUpload 
            logoPreview={logoPreview}
            setLogoPreview={setLogoPreview}
            onLogoChange={onLogoChange}
            error={errors.logo}
            required={true}
          />

          {/* Name and Slug - 4/5 width (Section A) */}
          <div className="w-4/5 space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={onInputChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
                placeholder="Enter merchant name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="slug"
                id="slug"
                value={formData.slug}
                onChange={onInputChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.slug ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
                placeholder="merchant-slug"
              />
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="category"
            id="category"
            value={formData.category || ''}
            onChange={onInputChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
            placeholder="Select category"
          />
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website
          </label>
          <input
            type="url"
            name="website"
            id="website"
            value={formData.website}
            onChange={onInputChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.website ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
            placeholder="https://www.merchant.com"
          />
          {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email || ''}
            onChange={onInputChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
            placeholder="contact@merchant.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone || ''}
            onChange={onInputChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
            placeholder="+1-555-0123"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={formData.address || ''}
            onChange={onInputChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.address ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
            placeholder="123 Business Street, City, State"
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            id="description"
            rows={4}
            value={formData.description}
            onChange={onInputChange}
            className={`mt-1 block w-full px-3 py-2 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
            placeholder="Describe the merchant's business, products, and services..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>
      </div>
    </div>
  );
}