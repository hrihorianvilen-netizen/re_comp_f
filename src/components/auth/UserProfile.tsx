'use client';

import { useState, useRef } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useUser, useUpdateProfile } from '@/hooks/useAuth';
import { getImageUrl } from '@/lib/utils';

export default function UserProfile() {
  const { data: user, isLoading } = useUser();
  const updateProfileMutation = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    displayName: user?.displayName || '',
    phone: user?.phone || '',
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData: {
      name?: string;
      displayName?: string;
      phone?: string;
      avatar?: File;
    } = {};
    
    if (formData.name !== user?.name) updateData.name = formData.name;
    if (formData.displayName !== user?.displayName) updateData.displayName = formData.displayName;
    if (formData.phone !== user?.phone) updateData.phone = formData.phone;
    if (selectedFile) updateData.avatar = selectedFile;
    
    if (Object.keys(updateData).length === 0) {
      return;
    }
    
    try {
      await updateProfileMutation.mutateAsync(updateData);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const hasChanges = () => {
    return (
      formData.name !== (user?.name || '') ||
      formData.displayName !== (user?.displayName || '') ||
      formData.phone !== (user?.phone || '') ||
      selectedFile !== null
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#198639]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Manage your account information</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <OptimizedImage
              src={previewUrl || getImageUrl(user.avatar) || '/images/default-avatar.png'}
              alt="Profile avatar"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
              sizeType="avatar"
              qualityPriority="high"
              priority
            />
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium text-[#198639] bg-white border border-[#198639] rounded-md hover:bg-[#198639] hover:text-white transition-colors"
            >
              Change Avatar
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max. 5MB)</p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
              placeholder="How others will see your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* Account Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Account Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-[#198639]">{user.reviewCount || 0}</div>
              <div className="text-xs text-gray-600">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-[#198639]">{user.commentCount || 0}</div>
              <div className="text-xs text-gray-600">Comments</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Status</div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user.status === 'active' ? 'bg-green-100 text-green-800' :
                user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.status || 'active'}
              </span>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Member since</div>
              <div className="text-xs text-gray-600">
                {new Date(user.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="submit"
            disabled={!hasChanges() || updateProfileMutation.isPending}
            className="px-6 py-2 bg-[#198639] text-white text-sm font-medium rounded-md hover:bg-[#15732f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#198639] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Success/Error Messages */}
        {updateProfileMutation.isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">Profile updated successfully!</p>
          </div>
        )}

        {updateProfileMutation.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              {updateProfileMutation.error.message || 'Failed to update profile'}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}