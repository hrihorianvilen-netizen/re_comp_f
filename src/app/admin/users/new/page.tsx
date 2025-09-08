'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NewUserPage() {
  const [formData, setFormData] = useState({
    displayName: '',
    userId: '',
    email: '',
    phoneNumber: '',
    registerIp: '',
    lastLoginIp: '',
    createdDate: '',
    lastLoginDate: '',
    newPassword: '',
    showPassword: false,
    requirePasswordReset: false,
    role: 'user',
    shopeeSearch: '',
    suspendUser: false,
    suspendAccount: false,
    suspendIps: false,
    suspendEmail: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSuspendUserChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      suspendUser: checked,
      suspendAccount: checked ? prev.suspendAccount : false,
      suspendIps: checked ? prev.suspendIps : false,
      suspendEmail: checked ? prev.suspendEmail : false
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Add User</h1>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Draft
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
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A96B11] hover:bg-[#8B5A0F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11]"
            >
              Save User
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

                  {/* User ID */}
                  <div>
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                      User ID
                    </label>
                    <input
                      type="text"
                      id="userId"
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="Enter user ID"
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
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="grid gird-cols-1 md:grid-cols-2 gap-6">
                    {/* Register IP */}
                    <div>
                      <label htmlFor="registerIp" className="block text-sm font-medium text-gray-700 mb-2">
                        Register IP Address
                      </label>
                      <input
                        type="text"
                        id="registerIp"
                        name="registerIp"
                        value={formData.registerIp}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="Enter register IP address"
                      />
                    </div>
                    {/* Created Date */}
                    <div>
                      <label htmlFor="createdDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Created Date
                      </label>
                      <input
                        type="datetime-local"
                        id="createdDate"
                        name="createdDate"
                        value={formData.createdDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      />
                    </div>

                    {/* Last Login IP */}
                    <div>
                      <label htmlFor="lastLoginIp" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Login IP Address
                      </label>
                      <input
                        type="text"
                        id="lastLoginIp"
                        name="lastLoginIp"
                        value={formData.lastLoginIp}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="Enter last login IP address"
                      />
                    </div>

                    {/* Last Login Date */}
                    <div>
                      <label htmlFor="lastLoginDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Login Date
                      </label>
                      <input
                        type="datetime-local"
                        id="lastLoginDate"
                        name="lastLoginDate"
                        value={formData.lastLoginDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      />
                    </div>
                  </div>
                  {/* Suspend User Section */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="suspendUser"
                          name="suspendUser"
                          checked={formData.suspendUser}
                          onChange={(e) => handleSuspendUserChange(e.target.checked)}
                          className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                        />
                        <label htmlFor="suspendUser" className="ml-2 text-sm font-medium text-gray-700">
                          Suspend this user
                        </label>
                      </div>

                      {/* Sub-checkboxes */}
                      <div className="ml-6 space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="suspendAccount"
                            name="suspendAccount"
                            checked={formData.suspendAccount}
                            onChange={handleInputChange}
                            disabled={!formData.suspendUser}
                            className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11] disabled:opacity-50"
                          />
                          <label htmlFor="suspendAccount" className="ml-2 text-sm text-gray-600">
                            Suspend account
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="suspendIps"
                            name="suspendIps"
                            checked={formData.suspendIps}
                            onChange={handleInputChange}
                            disabled={!formData.suspendUser}
                            className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11] disabled:opacity-50"
                          />
                          <label htmlFor="suspendIps" className="ml-2 text-sm text-gray-600">
                            Suspend IP(s)
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="suspendEmail"
                            name="suspendEmail"
                            checked={formData.suspendEmail}
                            onChange={handleInputChange}
                            disabled={!formData.suspendUser}
                            className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11] disabled:opacity-50"
                          />
                          <label htmlFor="suspendEmail" className="ml-2 text-sm text-gray-600">
                            Suspend email
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Section (1/3 width) */}
            <div className="col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Password</h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={formData.showPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="Enter new password"
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
                          value="merchant"
                          checked={formData.role === 'merchant'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#A96B11] border-gray-300 focus:ring-[#A96B11]"
                        />
                        <label htmlFor="role-merchant" className="ml-2 text-sm text-gray-700">
                          Merchant
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
                          id="role-administrator"
                          name="role"
                          value="administrator"
                          checked={formData.role === 'administrator'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#A96B11] border-gray-300 focus:ring-[#A96B11]"
                        />
                        <label htmlFor="role-administrator" className="ml-2 text-sm text-gray-700">
                          Administrator
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Shopee Search Field */}
                  <div>
                    <label htmlFor="shopeeSearch" className="block text-sm font-medium text-gray-700 mb-2">
                      Shopee Search
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="shopeeSearch"
                        name="shopeeSearch"
                        value={formData.shopeeSearch}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="Search shopee..."
                      />
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