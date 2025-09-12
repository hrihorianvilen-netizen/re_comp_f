'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCreateUser } from '@/hooks/useUsers';

export default function NewUserPage() {
  const router = useRouter();
  const createUserMutation = useCreateUser();
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    password: '',
    showPassword: false,
    requirePasswordReset: false,
    role: 'user' as 'user' | 'merchant_admin' | 'moderator' | 'admin',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    suspensionType: 'account' as 'account' | 'email',
    suspensionReason: '',
    suspensionDuration: 30
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userData = {
        displayName: formData.displayName,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        role: formData.role,
        requirePasswordReset: formData.requirePasswordReset,
        status: formData.status,
        suspensionType: formData.status === 'suspended' ? formData.suspensionType : undefined,
        suspensionReason: formData.status === 'suspended' ? formData.suspensionReason : undefined,
        suspensionDuration: formData.status === 'suspended' ? formData.suspensionDuration : undefined
      };
      
      await createUserMutation.mutateAsync(userData);
      router.push('/admin/users');
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Add User</h1>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              New User
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/users"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="user-form"
              disabled={createUserMutation.isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A96B11] hover:bg-[#8B5A0F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11] disabled:opacity-50"
            >
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </div>

        <form id="user-form" onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-6">
            {/* Information Section (2/3 width) */}
            <div className="col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">User Information</h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Display Name */}
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="Enter display name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="Enter phone number"
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* Settings Section (1/3 width) */}
            <div className="col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Status Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Suspension Options - Only show when suspended is selected */}
                  {formData.status === 'suspended' && (
                    <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-md">
                      <h3 className="text-sm font-medium text-red-800">Suspension Settings</h3>
                      
                      {/* Suspension Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Suspension Type</label>
                        <select
                          name="suspensionType"
                          value={formData.suspensionType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        >
                          <option value="account">Account Only</option>
                          <option value="email">Email Address</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.suspensionType === 'account' && 'Suspend this user account only'}
                          {formData.suspensionType === 'email' && 'Prevent new accounts with this email'}
                        </p>
                      </div>

                      {/* Suspension Reason */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Suspension Reason</label>
                        <textarea
                          name="suspensionReason"
                          value={formData.suspensionReason}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                          placeholder="Enter reason for suspension..."
                        />
                      </div>

                      {/* Suspension Duration */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Suspension Duration (days)</label>
                        <input
                          type="number"
                          name="suspensionDuration"
                          value={formData.suspensionDuration}
                          onChange={handleInputChange}
                          min="1"
                          max="365"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum: 365 days (1 year)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={formData.showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="Enter password"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {formData.showPassword ? (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Reset Checkbox */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requirePasswordReset"
                      name="requirePasswordReset"
                      checked={formData.requirePasswordReset}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                    <label htmlFor="requirePasswordReset" className="ml-2 text-sm text-gray-700">
                      Require password reset on first login
                    </label>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Role</label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="role-user"
                          name="role"
                          value="user"
                          checked={formData.role === 'user'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#A96B11] border-gray-300 focus:ring-[#A96B11]"
                        />
                        <label htmlFor="role-user" className="ml-2 text-sm text-gray-700">
                          User
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="role-merchant"
                          name="role"
                          value="merchant_admin"
                          checked={formData.role === 'merchant_admin'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#A96B11] border-gray-300 focus:ring-[#A96B11]"
                        />
                        <label htmlFor="role-merchant" className="ml-2 text-sm text-gray-700">
                          Merchant Admin
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="role-moderator"
                          name="role"
                          value="moderator"
                          checked={formData.role === 'moderator'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#A96B11] border-gray-300 focus:ring-[#A96B11]"
                        />
                        <label htmlFor="role-moderator" className="ml-2 text-sm text-gray-700">
                          Moderator
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="role-admin"
                          name="role"
                          value="admin"
                          checked={formData.role === 'admin'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#A96B11] border-gray-300 focus:ring-[#A96B11]"
                        />
                        <label htmlFor="role-admin" className="ml-2 text-sm text-gray-700">
                          Admin
                        </label>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}