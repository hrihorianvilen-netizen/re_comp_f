'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ForgotPasswordModal } from '@/components/auth';
import { CongratulationsModal } from '@/components/modals';
import { useLogin, useRegister } from '@/hooks/useAuth';
import { AuthResponse } from '@/types/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess?: (userData: AuthResponse) => void;
  onRegistrationSuccess?: () => void;
  onModeChange?: (mode: AuthMode) => void;
}

type AuthMode = 'login' | 'register';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess, onRegistrationSuccess, onModeChange }: AuthModalProps) {
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [registrationResult, setRegistrationResult] = useState<AuthResponse | null>(null);
  
  // Update mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const validate = () => {
    const newErrors: Partial<typeof formData> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (mode === 'register' && !formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setErrors({});

    try {
      if (mode === 'register') {
        const result = await registerMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName || 'Anonymous',
        });

        if (result) {
          setRegistrationResult({ user: result.user!, token: result.token! });
          setShowCongratulations(true);
          if (onRegistrationSuccess) {
            onRegistrationSuccess();
          }
        }
      } else {
        const result = await loginMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
        });

        if (result) {
          if (onSuccess) {
            onSuccess({ user: result.user!, token: result.token! });
          }
          onClose();
        }
      }
    } catch (error: any) {
      setErrors({ email: error.message || 'Authentication failed' });
    }
  };

  const handleSocialLogin = (provider: string) => {
    // In a real app, this would initiate OAuth flow
    console.log(`${provider} login initiated`);
  };

  const toggleMode = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    setErrors({});
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#00000080] bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Login' : 'Register'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Your email *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Your password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Display Name (Register only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display name *
              </label>
              <input
                type="text"
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
                placeholder="Choose a display name"
              />
              {errors.displayName && (
                <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
              )}
            </div>
          )}

          {/* Forgot Password (Login only) */}
          {mode === 'login' && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(true);
                }}
                className="text-sm text-[#198639] hover:underline"
              >
                Forget password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loginMutation.isPending || registerMutation.isPending}
            className="w-full bg-[#198639] text-white py-2 px-4 rounded-md hover:bg-[#15732f] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(mode === 'register' ? registerMutation.isPending : loginMutation.isPending) 
              ? (mode === 'register' ? 'Creating account...' : 'Logging in...') 
              : (mode === 'register' ? 'Join now' : 'Login')}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Login with Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 text-sm">Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Login with Facebook"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-gray-700 text-sm">Facebook</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Login with Apple"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#000000" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.05-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="text-gray-700 text-sm">Apple</span>
            </button>
          </div>

          {/* Toggle Mode */}
          <div className="text-center pt-2">
            <span className="text-sm text-gray-600">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-[#198639] hover:underline font-medium"
            >
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          onSuccess={() => {
            setShowForgotPassword(false);
            // Show success message or redirect to login
          }}
        />
      )}
      
      {/* Congratulations Modal */}
      <CongratulationsModal
        isOpen={showCongratulations}
        onClose={() => {
          setShowCongratulations(false);
          if (onSuccess && registrationResult) {
            onSuccess(registrationResult);
          }
          onClose();
        }}
      />
    </div>
  );
}