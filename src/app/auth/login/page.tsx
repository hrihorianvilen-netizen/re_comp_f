'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthModal from '@/components/AuthModal';
import { AuthResponse } from '@/types/api';

export default function LoginPage() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Show modal when component mounts
    setShowModal(true);
  }, []);

  const handleClose = () => {
    setShowModal(false);
    // Navigate back to home page when modal is closed
    router.push('/');
  };

  const handleSuccess = (userData: AuthResponse) => {
    console.log('User logged in:', userData);
    setShowModal(false);
    // In a real app, you would handle successful login here
    // For now, just redirect to home
    router.push('/');
  };

  const handleModeChange = (mode: 'login' | 'register') => {
    if (mode === 'register') {
      // Navigate to signup page when user clicks Register
      router.push('/auth/signup');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page content - minimal since modal will overlay */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome Back</h1>
          <p className="text-gray-600">Please login to continue</p>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showModal}
        initialMode="login"
        onClose={handleClose}
        onSuccess={handleSuccess}
        onModeChange={handleModeChange}
      />
    </div>
  );
}