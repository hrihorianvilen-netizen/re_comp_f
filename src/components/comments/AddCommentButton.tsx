'use client';

import { useState } from 'react';
import { useAddComment } from '@/hooks/useMerchants';

interface AddCommentButtonProps {
  reviewId: string;
  merchantSlug: string;
}

const reactionEmojis = {
  '❤️': { emoji: '❤️', label: 'Love' },
  '😢': { emoji: '😢', label: 'Sad' },
  '😡': { emoji: '😡', label: 'Angry' }
};

export default function AddCommentButton({ reviewId, merchantSlug }: AddCommentButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComment, setNewComment] = useState({ reaction: '❤️' as '❤️' | '😢' | '😡', content: '', displayName: '' });

  const addCommentMutation = useAddComment();

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.reaction) return;

    try {
      await addCommentMutation.mutateAsync({
        reviewId,
        merchantSlug,
        data: {
          reaction: newComment.reaction,
          content: newComment.content.trim() || undefined,
          displayName: newComment.displayName.trim() || undefined
        }
      });
      
      // Reset form
      setNewComment({ reaction: '❤️', content: '', displayName: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewComment({ reaction: '❤️', content: '', displayName: '' });
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
                  <textarea
                    id="modal-comment-content"
                    value={newComment.content}
                    onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent resize-none"
                    placeholder="Share your thoughts about this review..."
                  />
                </div>
                
                <div>
                  <label htmlFor="modal-display-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Display name (Optional)
                  </label>
                  <input
                    id="modal-display-name"
                    type="text"
                    value={newComment.displayName}
                    onChange={(e) => setNewComment(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
                    placeholder="How should we display your name?"
                  />
                </div>
                
                {/* Modal Footer */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={addCommentMutation.isPending || !newComment.reaction}
                    className="flex-1 px-4 py-2 bg-[#198639] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer text-center w-1/2"
                  >
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