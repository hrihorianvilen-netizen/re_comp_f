'use client';

import { useState } from 'react';
import { useChangePassword } from '@/hooks/useAuth';

export default function ChangePasswordForm() {
  const changePasswordMutation = useChangePassword();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      return 'All fields are required';
    }
    
    if (formData.newPassword.length < 6) {
      return 'New password must be at least 6 characters long';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      return 'New passwords do not match';
    }
    
    if (formData.currentPassword === formData.newPassword) {
      return 'New password must be different from current password';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) return;
    
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      // Reset form on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const validationError = validateForm();

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
        <p className="text-sm text-gray-600 mt-1">Update your account password</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              id="currentPassword"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              id="newPassword"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {/* Validation Error */}
        {validationError && formData.currentPassword && formData.newPassword && formData.confirmPassword && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{validationError}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!!validationError || changePasswordMutation.isPending}
          className="w-full px-4 py-2 bg-[#198639] text-white text-sm font-medium rounded-md hover:bg-[#15732f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#198639] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {changePasswordMutation.isPending ? 'Changing Password...' : 'Change Password'}
        </button>

        {/* Success/Error Messages */}
        {changePasswordMutation.isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">Password changed successfully!</p>
          </div>
        )}

        {changePasswordMutation.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              {changePasswordMutation.error.message || 'Failed to change password'}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}