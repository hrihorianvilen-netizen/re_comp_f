'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import moment from 'moment';
import { useUser, useUpdateUserStatus, useDeleteUser } from '@/hooks/useUsers';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    name: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    provider: '',
    isEmailVerified: false,
    suspendedReason: '',
    suspendedUntil: '',
    suspensionType: 'account' as 'account' | 'email',
    suspensionReason: '',
    suspensionDuration: 30,
    newPassword: '',
    showPassword: false,
    requirePasswordReset: false,
    suspendUser: false,
    suspendAccount: false,
    suspendIps: false,
    suspendEmail: false
  });

  const { data: user, isLoading, error } = useUser(userId);
  const updateUserStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        status: user.status || 'active',
        provider: user.provider || 'email',
        isEmailVerified: user.isEmailVerified || false,
        suspendedReason: user.suspendedReason || '',
        suspendedUntil: user.suspendedUntil || '',
        suspensionType: 'account' as 'account' | 'email',
        suspensionReason: user.suspendedReason || '',
        suspensionDuration: 30,
        newPassword: '',
        showPassword: false,
        requirePasswordReset: false,
        suspendUser: user.status === 'suspended',
        suspendAccount: user.status === 'suspended',
        suspendIps: false,
        suspendEmail: false
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSuspendUserChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      suspendUser: checked,
      status: checked ? 'suspended' : 'active',
      suspendAccount: checked ? prev.suspendAccount : false,
      suspendIps: checked ? prev.suspendIps : false,
      suspendEmail: checked ? prev.suspendEmail : false
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Update user status if it changed
      if (formData.status !== user?.status) {
        await updateUserStatusMutation.mutateAsync({
          id: userId,
          data: {
            status: formData.status as 'active' | 'inactive' | 'suspended',
            suspensionType: formData.status === 'suspended' ? formData.suspensionType : undefined,
            suspensionReason: formData.status === 'suspended' ? formData.suspensionReason : undefined,
            suspensionDuration: formData.status === 'suspended' ? formData.suspensionDuration : undefined
          }
        });
      }
      
      setIsEditing(false);
      // Add success notification here
    } catch (error) {
      console.error('Failed to update user:', error);
      // Add error notification here
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete user "${user?.displayName || user?.email}"? This action cannot be undone.`)) {
      try {
        await deleteUserMutation.mutateAsync(userId);
        router.push('/admin/users');
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleStatusChange = async (status: 'active' | 'suspended') => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: userId,
        data: {
          status,
          suspensionType: status === 'suspended' ? 'account' : undefined,
          suspensionReason: status === 'suspended' ? 'Quick suspension by admin' : undefined,
          suspensionDuration: status === 'suspended' ? 30 : undefined
        }
      });
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never';
    return moment(dateString).format('HH:mm:ss DD/MM/YYYY');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: '#4b8eff', bg: 'bg-blue-50', text: 'text-blue-700' },
      inactive: { color: '#999999', bg: 'bg-gray-50', text: 'text-gray-700' },
      suspended: { color: '#ff553e', bg: 'bg-red-50', text: 'text-red-700' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span 
          className="w-2 h-2 rounded-full mr-1.5" 
          style={{ backgroundColor: config.color }}
        ></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getProviderBadge = (provider: string) => {
    const typeConfig = {
      email: 'bg-green-100 text-green-800',
      google: 'bg-red-100 text-red-800',
      facebook: 'bg-blue-100 text-blue-800',
      apple: 'bg-gray-100 text-gray-800'
    };

    const badgeClass = typeConfig[provider as keyof typeof typeConfig] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {provider.charAt(0).toUpperCase() + provider.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#A96B11]"></div>
            <p className="mt-2 text-gray-500">Loading user details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading user: {error?.message || 'User not found'}</p>
            <Link
              href="/admin/users"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A96B11] hover:bg-[#8b5a0e]"
            >
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit User' : 'User Details'}
            </h1>
            {getStatusBadge(user.status || 'inactive')}
            <span className="text-sm text-gray-500">
              ID: {userId.slice(0, 8)}...
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/users"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11]"
            >
              Back to Users
            </Link>
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A96B11] hover:bg-[#8B5A0F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11]"
                >
                  Edit User
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete User
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="user-form"
                  disabled={updateUserStatusMutation.isPending}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A96B11] hover:bg-[#8B5A0F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11] disabled:opacity-50"
                >
                  {updateUserStatusMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
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
                    {isEditing ? (
                      <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="Enter display name"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2">{user.displayName || 'Not set'}</p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="Enter full name"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2">{user.name || 'Not set'}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                          placeholder="Enter email address"
                        />
                      ) : (
                        <p className="text-sm text-gray-900 py-2 flex-1">{user.email}</p>
                      )}
                      {user.isEmailVerified ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 py-2">{user.phone || 'Not set'}</p>
                    )}
                  </div>

                  {/* Provider and Account Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Login Provider
                      </label>
                      <div className="py-2">
                        {getProviderBadge(user.provider || 'email')}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Status
                      </label>
                      <div className="py-2">
                        {getStatusBadge(user.status || 'inactive')}
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Created Date
                      </label>
                      <p className="text-sm text-gray-900 py-2">{formatDateTime(user.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Login
                      </label>
                      <p className="text-sm text-gray-900 py-2">{formatDateTime(user.lastLoginAt)}</p>
                    </div>
                  </div>

                  {/* Activity Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reviews Posted
                      </label>
                      <p className="text-sm text-gray-900 py-2">{user.reviewCount || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comments Posted
                      </label>
                      <p className="text-sm text-gray-900 py-2">{user.commentCount || 0}</p>
                    </div>
                  </div>

                  {/* Suspension Section */}
                  {(isEditing || user.status === 'suspended') && (
                    <div className="border-t border-gray-200 pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="suspendUser"
                            name="suspendUser"
                            checked={formData.suspendUser}
                            onChange={(e) => handleSuspendUserChange(e.target.checked)}
                            disabled={!isEditing}
                            className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11] disabled:opacity-50"
                          />
                          <label htmlFor="suspendUser" className="ml-2 text-sm font-medium text-gray-700">
                            Suspend this user
                          </label>
                        </div>

                        {user.suspendedReason && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Suspension Reason
                            </label>
                            <p className="text-sm text-red-600 py-2">{user.suspendedReason}</p>
                          </div>
                        )}

                        {user.suspendedUntil && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Suspended Until
                            </label>
                            <p className="text-sm text-red-600 py-2">{formatDateTime(user.suspendedUntil)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Section (1/3 width) */}
            <div className="col-span-1">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Actions</h2>
                </div>
                <div className="p-6 space-y-6">
                  {isEditing && (
                    <>
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
                            placeholder="Enter new password (optional)"
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
                        <p className="text-xs text-gray-500 mt-1">Leave empty to keep current password</p>
                      </div>
                    </>
                  )}

                  {!isEditing && (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <strong>Quick Actions:</strong>
                      </div>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => handleStatusChange('active')}
                          disabled={user.status === 'active'}
                          className="w-full px-3 py-2 text-sm border border-green-300 rounded-md text-green-700 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Activate User
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange('suspended')}
                          disabled={user.status === 'suspended'}
                          className="w-full px-3 py-2 text-sm border border-red-300 rounded-md text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Suspend User
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}