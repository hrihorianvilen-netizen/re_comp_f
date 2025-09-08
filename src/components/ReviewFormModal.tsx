'use client';

import { useState } from 'react';
import InteractiveRatingStars from './InteractiveRatingStars';
import AuthModal from './AuthModal';
import SimpleCaptcha from './SimpleCaptcha';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantName: string;
  onSubmit: (data: ReviewFormData) => void;
}

export interface ReviewFormData {
  displayName: string;
  rating: number;
  title: string;
  content: string;
  recommend: boolean;
}

export default function ReviewFormModal({ isOpen, onClose, merchantName, onSubmit }: ReviewFormModalProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState<ReviewFormData>({
    displayName: '',
    rating: 0,
    title: '',
    content: '',
    recommend: true,
  });

  const [errors, setErrors] = useState<Partial<ReviewFormData>>({});
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(false);

  const validate = () => {
    const newErrors: Partial<ReviewFormData> = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }
    if (formData.rating === 0) {
      newErrors.rating = 1;
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.content.trim() || formData.content.length < 20) {
      newErrors.content = 'Review must be at least 20 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && isCaptchaVerified) {
      onSubmit(formData);
      // Reset form
      setFormData({
        displayName: '',
        rating: 0,
        title: '',
        content: '',
        recommend: true,
      });
      setIsCaptchaVerified(false);
      setCaptchaReset(true);
      onClose();
    } else if (!isCaptchaVerified) {
      // Show captcha error or focus on captcha
      alert('Please complete the captcha verification.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#00000080] bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
              <p className="text-sm text-gray-600 mt-1">Share your experience with {merchantName}</p>
            </div>
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

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Rating */}
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <InteractiveRatingStars
                initialRating={formData.rating}
                onRatingChange={(rating) => setFormData({ ...formData, rating })}
              />
            </div>
            <p className="text-sm text-gray-600">Tap to rate</p>
            {errors.rating && (
              <p className="text-red-500 text-sm mt-1">Please select a rating</p>
            )}        
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
              placeholder="Enter your display name"
            />
            {errors.displayName && (
              <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
            )}
          </div>

          {/* Review Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Review Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
              placeholder="Summarize your experience"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Review Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Your Review *
            </label>
            <textarea
              id="content"
              rows={5}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent resize-none"
              placeholder="Tell us about your experience with this merchant..."
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Minimum 20 characters</span>
              <span>{formData.content.length} characters</span>
            </div>
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {/* Recommendation */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recommend"
              checked={formData.recommend}
              onChange={(e) => setFormData({ ...formData, recommend: e.target.checked })}
              className="w-4 h-4 text-[#198639] border-gray-300 rounded focus:ring-[#198639]"
            />
            <label htmlFor="recommend" className="text-sm text-gray-700">
              I would recommend this merchant to a friend
            </label>
          </div>

          {/* Captcha */}
          <SimpleCaptcha
            onVerify={setIsCaptchaVerified}
            reset={captchaReset}
          />

          {/* Submit Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              className="w-full bg-[#198639] text-white py-2 px-4 rounded-md hover:bg-[#15732f] font-medium transition-colors"
            >
              Submit Review
            </button>
            
            {/* Register/Login Buttons */}
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('register');
                  setShowAuthModal(true);
                }}
                className="px-6 py-2 bg-white text-gray-700 text-sm rounded-md hover:bg-gray-100 font-medium transition-colors border border-gray-300"
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setShowAuthModal(true);
                }}
                className="px-6 py-2 bg-white text-gray-700 text-sm rounded-md hover:bg-gray-100 font-medium transition-colors border border-gray-300"
              >
                Login
              </button>
            </div>
            
            {/* Terms & Conditions */}
            <p className="text-xs text-gray-500 text-center">
              By clicking Submit Review you agree to our Terms & Conditions.
            </p>
          </div>
        </form>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(userData) => {
          // Handle successful authentication
          setFormData({ ...formData, displayName: userData.displayName || userData.email });
          setShowAuthModal(false);
        }}
      />
    </div>
  );
}