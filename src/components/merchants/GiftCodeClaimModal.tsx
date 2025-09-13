'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { AuthModal } from '@/components/auth';
import { ReviewFormModal } from '@/components/reviews';

interface GiftCodePromotion {
  id: string;
  title: string;
  description: string;
  type: string;
  loginRequired: boolean;
  reviewRequired: boolean;
  isAvailable: boolean;
  hasUserClaimed: boolean;
}

interface GiftCodeClaimModalProps {
  promotion: GiftCodePromotion;
  merchantName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GiftCodeClaimModal({
  promotion,
  merchantName,
  isOpen,
  onClose,
  onSuccess
}: GiftCodeClaimModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimedCode, setClaimedCode] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [validating, setValidating] = useState(true);
  const [canClaim, setCanClaim] = useState(false);
  const [validationReasons, setValidationReasons] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      validateClaim();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, promotion.id]);

  const validateClaim = async () => {
    setValidating(true);
    setError(null);

    try {
      const response = await api.validateGiftCodeClaim(promotion.id);
      if (response.data) {
        setCanClaim(response.data.canClaim);
        setValidationReasons(response.data.reasons);

        // Check if we need to show login or review modal
        if (!response.data.canClaim) {
          if (response.data.requirements.loginRequired && !response.data.requirements.isLoggedIn) {
            // Will show login prompt
          } else if (response.data.requirements.reviewRequired && !response.data.requirements.hasReview) {
            // Will show review prompt
          }
        }
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setError('Failed to validate claim eligibility');
    } finally {
      setValidating(false);
    }
  };

  const handleClaim = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.claimGiftCode(promotion.id, user?.displayName);

      if (response.error) {
        // Handle specific error cases
        if (response.error.includes('Login required')) {
          setShowAuthModal(true);
          return;
        } else if (response.error.includes('review')) {
          setShowReviewModal(true);
          return;
        }
        setError(response.error);
        return;
      }

      if (response.data) {
        setClaimedCode(response.data.code);
        onSuccess();
      }
    } catch (error) {
      console.error('Claim failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to claim gift code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (claimedCode) {
      navigator.clipboard.writeText(claimedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Re-validate after login
    validateClaim();
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    // Re-validate after review
    validateClaim();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={onClose}
          />

          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    {claimedCode ? 'Your Gift Code' : promotion.title}
                  </h3>

                  {validating ? (
                    <div className="mt-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ) : claimedCode ? (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Congratulations! Your gift code has been successfully claimed.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500 mb-2">Your Code:</p>
                        <p className="text-2xl font-bold text-[#198639] font-mono">{claimedCode}</p>
                        <button
                          onClick={handleCopyCode}
                          className="mt-3 inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          {copied ? (
                            <>
                              <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Copy Code
                            </>
                          )}
                        </button>
                      </div>
                      <p className="mt-4 text-xs text-gray-500">
                        Please save this code. You can also find it in your account under &quot;My Claimed Codes&quot;.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{promotion.description}</p>

                      {!canClaim && validationReasons.length > 0 && (
                        <div className="mt-4 bg-yellow-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-yellow-800 mb-2">Requirements not met:</p>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            {validationReasons.map((reason, index) => (
                              <li key={index} className="flex items-start">
                                <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {error && (
                        <div className="mt-4 bg-red-50 rounded-lg p-3">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      )}

                      {canClaim && (
                        <div className="mt-4 bg-green-50 rounded-lg p-3">
                          <p className="text-sm text-green-800">✓ You are eligible to claim this gift code!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              {claimedCode ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex w-full justify-center rounded-md bg-[#198639] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#15732f] sm:w-auto"
                >
                  Done
                </button>
              ) : (
                <>
                  {canClaim && (
                    <button
                      type="button"
                      onClick={handleClaim}
                      disabled={loading}
                      className="inline-flex w-full justify-center rounded-md bg-[#198639] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#15732f] disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                    >
                      {loading ? 'Claiming...' : 'Claim Code'}
                    </button>
                  )}

                  {!canClaim && validationReasons.includes('Login required') && (
                    <button
                      type="button"
                      onClick={() => setShowAuthModal(true)}
                      className="inline-flex w-full justify-center rounded-md bg-[#198639] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#15732f] sm:ml-3 sm:w-auto"
                    >
                      Login to Claim
                    </button>
                  )}

                  {!canClaim && validationReasons.includes('Review required (minimum 100 characters)') && (
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(true)}
                      className="inline-flex w-full justify-center rounded-md bg-[#198639] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#15732f] sm:ml-3 sm:w-auto"
                    >
                      Write Review to Claim
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          initialMode="login"
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewFormModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSuccess}
          merchantName={merchantName}
        />
      )}
    </>
  );
}