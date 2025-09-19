'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EMOTION_REACTIONS } from '@/lib/reactions';
import { AuthModal } from '@/components/auth';
import RichTextEditor from '@/components/ui/RichTextEditor';

interface CommentFormProps {
  reviewId: string;
  onSubmit: (data: CommentFormData) => void;
  onCancel: () => void;
}

export interface CommentFormData {
  title: string;
  content: string;
  selectedReaction?: string;
}


export default function CommentForm({ reviewId, onSubmit }: CommentFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState<CommentFormData>({
    title: '',
    content: '',
    selectedReaction: undefined,
  });

  const [errors, setErrors] = useState<Partial<CommentFormData>>({});

  const validate = () => {
    const newErrors: Partial<CommentFormData> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.content.trim() || formData.content.length < 10) {
      newErrors.content = 'Comment must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setAuthModalMode('login');
      setShowAuthModal(true);
      return;
    }
    
    if (validate()) {
      onSubmit(formData);
      // Reset form
      setFormData({
        title: '',
        content: '',
        selectedReaction: undefined,
      });
    }
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-gray-900">Leave a Reply</h4>
        
        {/* Emoji Reaction Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Express your feeling (optional)
          </label>
          <div className="flex items-center gap-3">
            {EMOTION_REACTIONS.map((reaction) => (
              <button
                key={reaction.id}
                type="button"
                onClick={() => {
                  setFormData({ 
                    ...formData, 
                    selectedReaction: formData.selectedReaction === reaction.id ? undefined : reaction.id 
                  });
                }}
                className={`flex items-center gap-1 p-2 rounded-lg transition-colors ${
                  formData.selectedReaction === reaction.id
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <span className="text-2xl">
                  {reaction.emoji}
                </span>
                <span className="text-xs text-gray-700">{reaction.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Comment Title */}
        <div>
          <label htmlFor={`title-${reviewId}`} className="block text-sm font-medium text-gray-700 mb-1">
            Comment Title *
          </label>
          <input
            type="text"
            id={`title-${reviewId}`}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent text-sm"
            placeholder="Enter a title for your comment"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label htmlFor={`comment-${reviewId}`} className="block text-sm font-medium text-gray-700 mb-1">
            Your Comment *
          </label>
          <RichTextEditor
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
            placeholder="Write your comment..."
            minLength={10}
            maxLength={1000}
            height="min-h-[80px] max-h-[150px]"
            showPreview={false}
          />
          {errors.content && (
            <p className="text-red-500 text-xs mt-1">{errors.content}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="space-y-3">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-[#198639] text-white text-sm rounded-md hover:bg-[#15732f] font-medium transition-colors"
          >
            {isAuthenticated ? 'Submit Comment' : 'Login to Comment'}
          </button>
          
          {/* Show Register/Login buttons only if not authenticated */}
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
          
          {/* User info if authenticated */}
          {isAuthenticated && user && (
            <p className="text-xs text-gray-600 text-center">
              Commenting as {user.displayName || user.email}
            </p>
          )}
          
          {/* Terms & Conditions */}
          <p className="text-xs text-gray-500 text-center">
            By clicking Submit Comment you agree to our Terms & Conditions.
          </p>
        </div>
      </form>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(userData) => {
          // Handle successful authentication
          console.log('User authenticated:', userData);
          setShowAuthModal(false);
        }}
      />
    </div>
  );
}