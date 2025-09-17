'use client';

import { useState, useEffect } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile, useUploadAvatar, useUser } from '@/hooks/useAuth';
import ChangePasswordForm from './ChangePasswordForm';

type TabType = 'personal' | 'password' | 'security';

export default function AccountManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    displayName: '',
    status: 'active'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { data: reactQueryUser, refetch: refetchUser } = useUser();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();

  // Use React Query user data if available, fallback to Auth context
  const currentUser = reactQueryUser || user;

  // Helper function to get full avatar URL
  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    // If it's a relative URL, prepend the API base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reviews-backend-2zkw.onrender.com';
    const fullUrl = `${baseUrl.replace('/api', '')}${avatar}`;
    console.log('Generated avatar URL:', fullUrl, 'from avatar:', avatar);
    return fullUrl;
  };

  // Initialize form data when user is loaded
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        displayName: currentUser.displayName || '',
        status: currentUser.status || 'active'
      });
    }
  }, [currentUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      // Upload avatar first if selected
      if (selectedFile) {
        const result = await uploadAvatarMutation.mutateAsync(selectedFile);
        removeSelectedFile();
        console.log('Avatar upload result:', result);
      }

      // Update profile data (exclude status as it's disabled)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { status, ...profileData } = formData;
      const result = await updateProfileMutation.mutateAsync(profileData);
      console.log('Profile update result:', result);
      
      // Refetch user data to reflect changes
      await refetchUser();
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'personal' as TabType, name: 'Personal Information', icon: '👤' },
    { id: 'password' as TabType, name: 'Password & Security', icon: '🔒' },
    { id: 'security' as TabType, name: 'Account Security', icon: '🛡️' },
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#198639]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and security settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - User Profile Info (1/3 width) */}
          <div className="lg:w-1/3 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* User Avatar and Basic Info */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                {(previewUrl || getAvatarUrl(currentUser.avatar)) ? (
                  <div className="w-[120px] h-[120px] relative mx-auto">
                    <OptimizedImage
                      src={previewUrl || getAvatarUrl(currentUser.avatar) || ''}
                      alt={currentUser.displayName || currentUser.name || 'User'}
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-gray-100 shadow-md object-cover w-full h-full"
                      sizeType="avatar"
                      qualityPriority="high"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-[120px] h-[120px] bg-gradient-to-br from-[#198639] to-[#15732f] rounded-full mx-auto flex items-center justify-center border-4 border-gray-100 shadow-md">
                    <span className="text-white text-4xl font-bold">
                      {(currentUser.displayName || currentUser.name || currentUser.email)?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                  {/* Change Photo Button */}
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-[#198639] text-white rounded-full p-2 cursor-pointer hover:bg-[#15732f] transition-colors shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mt-4">
                  {currentUser.displayName || currentUser.name || 'User'}
                </h2>
                <p className="text-gray-600 mt-1">{currentUser.email}</p>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mt-2 ${
                  currentUser.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentUser.status || 'Active'}
                </span>
              </div>

              {/* User Statistics */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Account Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#198639]">
                        {currentUser.reviewCount || 0}
                      </div>
                      <div className="text-xs text-gray-600">Reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#198639]">
                        {currentUser.commentCount || 0}
                      </div>
                      <div className="text-xs text-gray-600">Comments</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Account Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Member since:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(currentUser.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Email verified:</span>
                      <span className={`text-sm font-medium ${
                        currentUser.isEmailVerified ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {currentUser.isEmailVerified ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Tabs and Content (2/3 width) */}
          <div className="lg:w-2/3 flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Tab Bar */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-[#198639] text-[#198639]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'personal' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }} className="space-y-6">
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
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
                            placeholder="Enter your email"
                          />
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
                            placeholder="Enter your display name"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                          Account Status
                        </label>
                        <select
                          id="status"
                          value={formData.status}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={updateProfileMutation.isPending || uploadAvatarMutation.isPending}
                          className="px-6 py-2 bg-[#198639] text-white text-sm font-medium rounded-md hover:bg-[#15732f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#198639] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {(updateProfileMutation.isPending || uploadAvatarMutation.isPending) ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </div>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'password' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Password & Security</h3>
                    <ChangePasswordForm />
                  </div>
                )}

                {activeTab === 'security' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Security</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Security Settings Coming Soon
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>Additional security features like two-factor authentication will be available in a future update.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}