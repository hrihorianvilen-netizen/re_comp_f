'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';

interface CommentFormProps {
  reviewId: string;
  onSubmit: (data: CommentData) => void;
  onCancel?: () => void;
}

export interface CommentData {
  displayName?: string;
  reaction: string;
  content: string;
  captchaToken?: string;
}

const REACTIONS = [
  { emoji: '❤️', label: 'Love', value: 'love' },
  { emoji: '😢', label: 'Sad', value: 'sad' },
  { emoji: '😡', label: 'Angry', value: 'angry' },
];

export default function CommentForm({ onSubmit, onCancel }: CommentFormProps) {
  const { isAuthenticated, user } = useAuth();

  // Debug logging
  console.log('CommentForm - isAuthenticated:', isAuthenticated);
  console.log('CommentForm - user:', user);
  const [formData, setFormData] = useState<CommentData>({
    displayName: '',
    reaction: '',
    content: '',
  });
  const [errors, setErrors] = useState<Partial<CommentData>>({});
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [recaptchaRef, setRecaptchaRef] = useState<ReCAPTCHA | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if content is meaningful (not just spam characters)
  const isMeaningfulText = (text: string): boolean => {
    // Remove spaces and check length
    const trimmed = text.trim();
    if (trimmed.length < 10) return false;

    // Check for repeated characters (e.g., "aaaaa", "11111")
    const hasRepeatedChars = /^(.)\1{4,}$/.test(trimmed);
    if (hasRepeatedChars) return false;

    // Check for keyboard mashing (e.g., "asdfasdf", "qwerty")
    const keyboardPatterns = ['asdf', 'qwer', 'zxcv', '1234', '1111'];
    const lowerText = trimmed.toLowerCase();
    const hasKeyboardPattern = keyboardPatterns.some(pattern =>
      lowerText.includes(pattern) && lowerText.length < pattern.length * 3
    );
    if (hasKeyboardPattern) return false;

    // Check for variety of characters (at least 3 different chars)
    const uniqueChars = new Set(trimmed.split('')).size;
    if (uniqueChars < 3) return false;

    return true;
  };

  const validate = (): boolean => {
    const newErrors: Partial<CommentData> = {};

    // Reaction is required
    if (!formData.reaction) {
      newErrors.reaction = 'Please select a reaction';
    }

    // Content validation
    if (!formData.content.trim()) {
      newErrors.content = 'Comment is required';
    } else if (formData.content.trim().length < 10) {
      newErrors.content = 'Comment must be at least 10 characters';
    } else if (!isMeaningfulText(formData.content)) {
      newErrors.content = 'Please write a meaningful comment';
    } else if (formData.content.length > 1000) {
      newErrors.content = 'Comment must be less than 1000 characters';
    }

    // Display name for guests
    if (!isAuthenticated && !formData.displayName?.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Check captcha for guests
    if (!isAuthenticated && !isCaptchaVerified) {
      alert('Please complete the captcha verification');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        ...formData,
        displayName: isAuthenticated ? undefined : formData.displayName,
      });

      // Reset form
      setFormData({
        displayName: '',
        reaction: '',
        content: '',
      });
      setIsCaptchaVerified(false);
      if (recaptchaRef) {
        recaptchaRef.reset();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setFormData(prev => ({ ...prev, captchaToken: token || undefined }));
    setIsCaptchaVerified(!!token);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Add a Comment</h3>

      {/* Reaction Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose your reaction *
        </label>
        <div className="flex gap-3">
          {REACTIONS.map(reaction => (
            <button
              key={reaction.value}
              type="button"
              onClick={() => setFormData({ ...formData, reaction: reaction.value })}
              className={`
                px-4 py-2 rounded-lg border-2 transition-all
                ${formData.reaction === reaction.value
                  ? 'border-[#198639] bg-[#198639]/10'
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              title={reaction.label}
            >
              <span className="text-2xl">{reaction.emoji}</span>
            </button>
          ))}
        </div>
        {errors.reaction && (
          <p className="text-red-500 text-sm mt-1">{errors.reaction}</p>
        )}
      </div>

      {/* Display Name (for guests only) */}
      {!isAuthenticated ? (
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
            placeholder="Enter your name"
            maxLength={50}
          />
          {errors.displayName && (
            <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-600">
          Commenting as: <span className="font-semibold">{user?.displayName || user?.name || 'User'}</span>
        </div>
      )}

      {/* Comment Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Your Comment *
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
          placeholder="Share your thoughts about this review..."
          rows={4}
          maxLength={1000}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            Minimum 10 characters • {formData.content.length}/1000
          </p>
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content}</p>
          )}
        </div>
      </div>

      {/* Captcha for guests */}
      {!isAuthenticated ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Security Verification *
          </label>
          <ReCAPTCHA
            ref={(ref) => setRecaptchaRef(ref)}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
            onChange={handleCaptchaChange}
            onExpired={() => handleCaptchaChange(null)}
            onErrored={() => handleCaptchaChange(null)}
          />
          {!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
            <p className="text-xs text-red-500 mt-1">
              ReCAPTCHA not configured. Please add NEXT_PUBLIC_RECAPTCHA_SITE_KEY to your environment.
            </p>
          )}
        </div>
      ) : (
        <div className="text-xs text-gray-500">
          Verified user - no captcha required
        </div>
      )}

      {/* Submit Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-[#198639] text-white rounded-md hover:bg-[#15732f] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        By posting, you agree to our community guidelines. Spam or inappropriate comments may be automatically removed.
      </p>
    </form>
  );
}