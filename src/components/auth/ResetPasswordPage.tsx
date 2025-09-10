'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useResetPassword } from '@/hooks/useAuth';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resetPasswordMutation = useResetPassword();
  
  const [token, setToken] = useState('');
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Get token from URL params
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const validatePasswords = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!passwords.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwords.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setErrors({ token: 'Invalid or missing reset token' });
      return;
    }
    
    if (validatePasswords()) {
      try {
        await resetPasswordMutation.mutateAsync({
          token,
          newPassword: passwords.newPassword,
        });
        
        // Redirect to login page after successful reset
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (error) {
        console.error('Failed to reset password:', error);
      }
    }
  };

  const togglePasswordVisibility = (field: 'newPassword' | 'confirmPassword') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Invalid Reset Link</h2>
            <p className="mt-2 text-sm text-gray-600">
              The password reset link is invalid or has expired. Please request a new password reset.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-[#198639] text-white rounded-md hover:bg-[#15732f]"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Reset Your Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.newPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('newPassword')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.newPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Token Error */}
            {errors.token && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{errors.token}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full px-4 py-2 bg-[#198639] text-white text-sm font-medium rounded-md hover:bg-[#15732f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#198639] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resetPasswordMutation.isPending ? 'Resetting Password...' : 'Reset Password'}
            </button>

            {/* Success Message */}
            {resetPasswordMutation.isSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  Password reset successfully! Redirecting to home page...
                </p>
              </div>
            )}

            {/* Error Message */}
            {resetPasswordMutation.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  {resetPasswordMutation.error.message || 'Failed to reset password'}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}