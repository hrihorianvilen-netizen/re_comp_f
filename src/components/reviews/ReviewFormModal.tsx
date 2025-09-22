'use client';

import { useState, useEffect } from 'react';
import { InteractiveRatingStars } from '@/components/ui';
import { AuthModal } from '@/components/auth';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { useAuth } from '@/contexts/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';

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
  captchaToken?: string;
}

export default function ReviewFormModal({ isOpen, onClose, merchantName, onSubmit }: ReviewFormModalProps) {
  const { user, isAuthenticated } = useAuth();
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
  const [showTitleField, setShowTitleField] = useState(false);
  const [recaptchaRef, setRecaptchaRef] = useState<ReCAPTCHA | null>(null);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);

  // Helper function to strip HTML tags from content
  const stripHtmlTags = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // Auto-populate display name for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.displayName || user.name || user.email || 'Anonymous'
      }));
      setRequiresCaptcha(false);
    } else {
      setRequiresCaptcha(true);
    }
  }, [isAuthenticated, user]);

  // Show title field when content has at least 10 characters
  useEffect(() => {
    const plainTextContent = stripHtmlTags(formData.content);
    if (plainTextContent.length >= 10) {
      setShowTitleField(true);
      // Auto-populate title with first sentence if title is empty
      if (!formData.title) {
        const firstSentence = plainTextContent.split(/[.!?]/)[0].trim();
        if (firstSentence) {
          setFormData(prev => ({ ...prev, title: firstSentence }));
        }
      }
    } else {
      setShowTitleField(false);
    }
  }, [formData.content, formData.title]);

  const isMeaningfulText = (text: string): boolean => {
    // Check for repeated characters (e.g., "aaaaa", "12345")
    const hasRepeatedChars = /(..).*\1/.test(text.toLowerCase());
    const isSequential = /^(.)\1+$/.test(text) || /^(012|123|234|345|456|567|678|789|890|abc|bcd|cde)/.test(text.toLowerCase());
    const hasVariedContent = text.split('').filter((char, index, arr) => arr.indexOf(char) === index).length > 3;

    return !hasRepeatedChars && !isSequential && hasVariedContent && text.trim().length >= 10;
  };

  const validate = () => {
    const newErrors: Partial<ReviewFormData> = {};

    // Guest users need display name
    if (!isAuthenticated && !formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    // Rating is required
    if (formData.rating === 0) {
      newErrors.rating = 1;
    }

    // Content validation (min 10 chars, meaningful text)
    const plainTextContent = stripHtmlTags(formData.content);
    if (!plainTextContent.trim() || plainTextContent.length < 10) {
      newErrors.content = 'Review must be at least 10 characters';
    } else if (!isMeaningfulText(plainTextContent)) {
      newErrors.content = 'Please provide meaningful content for your review';
    }

    // Title validation (only when title field is shown)
    if (showTitleField && !formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Check captcha requirement
    if (requiresCaptcha && !isCaptchaVerified) {
      alert('Please complete the captcha verification.');
      return;
    }

    // Submit the review
    onSubmit({
      ...formData,
      captchaToken: formData.captchaToken
    });

    // Reset form
    setFormData({
      displayName: isAuthenticated && user ? user.displayName || user.name || user.email || 'Anonymous' : '',
      rating: 0,
      title: '',
      content: '',
      recommend: true,
    });
    setIsCaptchaVerified(false);
    setShowTitleField(false);
    if (recaptchaRef) {
      recaptchaRef.reset();
    }
    onClose();
  };

  const handleCaptchaChange = (token: string | null) => {
    setFormData(prev => ({ ...prev, captchaToken: token || undefined }));
    setIsCaptchaVerified(!!token);
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

          {/* Display Name - Only for guest users */}
          {!isAuthenticated && (
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
          )}

          {/* Review Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Your Review *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="Tell us about your experience with this merchant..."
              minLength={10}
              maxLength={1000}
              height="min-h-[120px] max-h-[200px]"
              showPreview={false}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 10 characters required. Current: {stripHtmlTags(formData.content).length}
            </p>
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {/* Review Title - Appears after content has 10+ characters */}
          {showTitleField && (
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
          )}


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

          {/* Captcha - Required for guests or suspicious activity */}
          {requiresCaptcha && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Verification *
              </label>
              <ReCAPTCHA
                ref={(ref) => setRecaptchaRef(ref)}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || 'your-recaptcha-site-key'}
                onChange={handleCaptchaChange}
                onExpired={() => handleCaptchaChange(null)}
                onErrored={() => handleCaptchaChange(null)}
              />
            </div>
          )}

          {/* Submit Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="submit"
              className="w-full bg-[#198639] text-white py-2 px-4 rounded-md hover:bg-[#15732f] font-medium transition-colors"
            >
              Submit Review
            </button>
            
            {/* Register/Login Buttons - Only show for guests */}
            {!isAuthenticated && (
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
            )}
            
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
          setFormData({ ...formData, displayName: userData.user?.displayName || userData.user?.email || 'Anonymous' });
          setShowAuthModal(false);
        }}
      />
    </div>
  );
}