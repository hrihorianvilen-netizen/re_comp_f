'use client';

import { useState } from 'react';
import { useAddComment } from '@/hooks/useMerchants';
import { useAuth } from '@/contexts/AuthContext';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';

interface AddCommentButtonProps {
  reviewId: string;
  merchantSlug: string;
  onCommentAdded?: () => void;
}

const reactionEmojis = {
  '❤️': { emoji: '❤️', label: 'Love' },
  '😢': { emoji: '😢', label: 'Sad' },
  '😡': { emoji: '😡', label: 'Angry' }
};

export default function AddCommentButton({ reviewId, merchantSlug, onCommentAdded }: AddCommentButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComment, setNewComment] = useState({ reaction: '❤️' as '❤️' | '😢' | '😡', content: '', displayName: '', captchaToken: '' });
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [recaptchaRef, setRecaptchaRef] = useState<ReCAPTCHA | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const addCommentMutation = useAddComment();

  const handleCaptchaChange = (token: string | null) => {
    setNewComment(prev => ({ ...prev, captchaToken: token || '' }));
    setIsCaptchaVerified(!!token);
    // Clear error when captcha is completed
    if (token) {
      setErrorMessage('');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors

    if (!newComment.reaction) {
      toast.error('Please select a reaction.');
      setErrorMessage('Please select a reaction.');
      return;
    }

    // Check display name for guests
    if (!isAuthenticated && !newComment.displayName.trim()) {
      toast.error('Display name is required.');
      setErrorMessage('Display name is required.');
      return;
    }

    // Check captcha requirement for guests
    if (!isAuthenticated && !isCaptchaVerified) {
      toast.error('Please complete the captcha verification.');
      setErrorMessage('Please complete the captcha verification.');
      return;
    }

    const loadingToast = toast.loading('Adding your comment...');

    try {
      await addCommentMutation.mutateAsync({
        reviewId,
        merchantSlug,
        data: {
          reaction: newComment.reaction,
          content: newComment.content.trim() || undefined,
          displayName: newComment.displayName.trim() || undefined,
          captchaToken: newComment.captchaToken || undefined
        }
      });
      
      // Reset form
      setNewComment({ reaction: '❤️', content: '', displayName: '', captchaToken: '' });
      setIsCaptchaVerified(false);
      if (recaptchaRef) {
        recaptchaRef.reset();
      }
      setIsModalOpen(false);

      toast.dismiss(loadingToast);
      toast.success('Comment added successfully!', {
        icon: '💬',
      });

      // Call the callback to refresh the parent component
      if (onCommentAdded) {
        onCommentAdded();
      }
      // React Query will also update any other components using the same data
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Failed to add comment:', error);

      // Extract meaningful error message
      let errorMsg = 'Failed to add comment. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('Captcha verification failed')) {
          errorMsg = 'Captcha verification failed. Please try again.';
          // Reset captcha on failure
          if (recaptchaRef) {
            recaptchaRef.reset();
          }
          setIsCaptchaVerified(false);
          setNewComment(prev => ({ ...prev, captchaToken: '' }));
        } else if (error.message.includes('Display name is required')) {
          errorMsg = 'Display name is required for guest comments.';
        } else if (error.message.includes('Comment not allowed')) {
          errorMsg = 'Comments are not allowed for this review.';
        } else if (error.message.includes('Server error')) {
          errorMsg = 'Server error. Please try again later.';
        } else {
          errorMsg = error.message;
        }
      }

      setErrorMessage(errorMsg);
      toast.error(errorMsg, {
        icon: '❌',
        duration: 5000,
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewComment({ reaction: '❤️', content: '', displayName: '', captchaToken: '' });
    setIsCaptchaVerified(false);
    setErrorMessage(''); // Clear errors when closing
    if (recaptchaRef) {
      recaptchaRef.reset();
    }
  };

  return (
    <>
      {/* Add Comment Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1 hover:bg-[#a96b11] hover:text-white px-2 py-1 rounded transition-all outline-none cursor-pointer text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Add comment</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#00000080] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Comment</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-red-700">{errorMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleAddComment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Your reaction *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(reactionEmojis).map(([key, { emoji }]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setNewComment(prev => ({ ...prev, reaction: key as '❤️' | '😢' | '😡' }))}
                        className={`px-4 py-3 rounded-lg border-2 transition-colors flex flex-col items-center space-y-1 ${
                          newComment.reaction === key
                            ? 'border-[#198639] bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-2xl">{emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="modal-comment-content" className="block text-sm font-medium text-gray-700 mb-2">
                    Comment (Optional)
                  </label>
                  <RichTextEditor
                    value={newComment.content}
                    onChange={(value) => setNewComment(prev => ({ ...prev, content: value }))}
                    placeholder="Share your thoughts about this review..."
                    minLength={0}
                    maxLength={1000}
                    height="min-h-[100px] max-h-[150px]"
                    showPreview={false}
                    required={false}
                  />
                </div>
                
                {/* Display Name - Required for guests */}
                {!isAuthenticated ? (
                  <div>
                    <label htmlFor="modal-display-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Display name *
                    </label>
                    <input
                      id="modal-display-name"
                      type="text"
                      value={newComment.displayName}
                      onChange={(e) => setNewComment(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
                      placeholder="Enter your display name"
                      required
                    />
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    Commenting as: <span className="font-semibold">{user?.displayName || user?.name || user?.email || 'User'}</span>
                  </div>
                )}

                {/* Captcha - Required for guests */}
                {!isAuthenticated && (
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
                
                {/* Modal Footer */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={
                      addCommentMutation.isPending ||
                      !newComment.reaction ||
                      (!isAuthenticated && (!newComment.displayName.trim() || !isCaptchaVerified))
                    }
                    className="flex-1 px-4 py-2 bg-[#198639] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer text-center w-1/2 flex items-center justify-center"
                  >
                    {addCommentMutation.isPending && (
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                    {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer text-center w-1/2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}