'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import moment from 'moment';
import { useUser, useUpdateUserStatus } from '@/hooks/useUsers';

export default function SuspendedUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [formData, setFormData] = useState({
    suspensionType: 'account' as 'account' | 'email',
    suspensionReason: '',
    suspensionDuration: 30,
    suspendedUntil: '',
    permanentSuspension: false
  });
  
  const { data: user, isLoading, error } = useUser(userId);
  const updateUserStatusMutation = useUpdateUserStatus();
  
  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      // Determine suspension type from reason
      const suspensionType = user.suspendedReason?.includes('(email)') ? 'email' : 'account';
      
      // Calculate duration in days if suspended until date exists
      let duration = 30;
      if (user.suspendedUntil) {
        const daysRemaining = moment(user.suspendedUntil).diff(moment(), 'days');
        duration = Math.max(1, daysRemaining);
      }
      
      setFormData({
        suspensionType,
        suspensionReason: user.suspendedReason || '',
        suspensionDuration: duration,
        suspendedUntil: user.suspendedUntil ? moment(user.suspendedUntil).format('YYYY-MM-DD') : '',
        permanentSuspension: !user.suspendedUntil
      });
    }
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === 'permanentSuspension') {
      setFormData(prev => ({
        ...prev,
        permanentSuspension: checked,
        suspendedUntil: checked ? '' : prev.suspendedUntil
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  const handleUnsuspend = async () => {
    if (window.confirm('Are you sure you want to unsuspend this user?')) {
      try {
        await updateUserStatusMutation.mutateAsync({
          id: userId,
          data: {
            status: 'active'
          }
        });
        router.push('/admin/users/suspended');
      } catch (error) {
        console.error('Failed to unsuspend user:', error);
      }
    }
  };
  
  const handleUpdateSuspension = async () => {
    try {
      let suspendedUntilDate = null;
      
      if (!formData.permanentSuspension) {
        if (formData.suspendedUntil) {
          // Use the date picker value
          suspendedUntilDate = new Date(formData.suspendedUntil);
        } else {
          // Use duration in days
          suspendedUntilDate = new Date();
          suspendedUntilDate.setDate(suspendedUntilDate.getDate() + formData.suspensionDuration);
        }
      }
      
      const durationDays = suspendedUntilDate 
        ? Math.ceil((suspendedUntilDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 365; // Max duration for permanent
      
      await updateUserStatusMutation.mutateAsync({
        id: userId,
        data: {
          status: 'suspended',
          suspensionType: formData.suspensionType,
          suspensionReason: formData.suspensionReason,
          suspensionDuration: Math.max(1, Math.min(365, durationDays))
        }
      });
      
      router.push('/admin/users/suspended');
    } catch (error) {
      console.error('Failed to update suspension:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A96B11]"></div>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Failed to load user details. Please try again.</p>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3">
              <Link
                href="/admin/users/suspended"
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Suspended User Details</h1>
            </div>
            <p className="text-gray-600 mt-1">Manage suspension settings for {user.displayName || user.email}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleUnsuspend}
              className="px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50"
            >
              Unsuspend User
            </button>
            <button
              onClick={handleUpdateSuspension}
              disabled={updateUserStatusMutation.isPending}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A96B11] hover:bg-[#8B5A0F] disabled:opacity-50"
            >
              {updateUserStatusMutation.isPending ? 'Updating...' : 'Update Suspension'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          {/* User Information */}
          <div className="col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">User Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Display Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.displayName || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{user.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{user.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {moment(user.createdAt).format('DD/MM/YYYY HH:mm')}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Activity</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {moment(user.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Suspension Settings */}
            <div className="bg-white shadow rounded-lg mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Suspension Settings</h2>
              </div>
              <div className="p-6 space-y-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Suspension Period</label>
                  
                  {/* Permanent Suspension Checkbox */}
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="permanentSuspension"
                      name="permanentSuspension"
                      checked={formData.permanentSuspension}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                    <label htmlFor="permanentSuspension" className="ml-2 text-sm text-gray-700">
                      Permanent Suspension
                    </label>
                  </div>
                  
                  {!formData.permanentSuspension && (
                    <div className="space-y-4">
                      {/* Date Picker */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Suspend Until Date</label>
                        <input
                          type="date"
                          name="suspendedUntil"
                          value={formData.suspendedUntil}
                          onChange={handleInputChange}
                          min={moment().add(1, 'day').format('YYYY-MM-DD')}
                          max={moment().add(1, 'year').format('YYYY-MM-DD')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        />
                      </div>
                      
                      {/* OR Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">OR</span>
                        </div>
                      </div>
                      
                      {/* Duration in Days */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
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
                          Will suspend until: {moment().add(formData.suspensionDuration, 'days').format('DD/MM/YYYY')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Current Suspension Status */}
          <div className="col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Current Status</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                    Suspended
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Suspended At</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.updatedAt ? moment(user.updatedAt).format('DD/MM/YYYY HH:mm') : 'Unknown'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Suspended Until</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.suspendedUntil 
                      ? moment(user.suspendedUntil).format('DD/MM/YYYY HH:mm')
                      : 'Permanent'}
                  </p>
                  {user.suspendedUntil && (
                    <p className="text-xs text-gray-500 mt-1">
                      {moment(user.suspendedUntil).fromNow()}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Reason</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.suspendedReason || 'No reason provided'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Suspension Type</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.suspendedReason?.includes('(email)') ? 'Email Address' : 'Account Only'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button
                  onClick={() => router.push(`/admin/users/${userId}`)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  View Full User Profile
                </button>
                <button
                  onClick={handleUnsuspend}
                  className="w-full px-3 py-2 text-sm border border-green-300 rounded-md text-green-700 hover:bg-green-50"
                >
                  Unsuspend Immediately
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}