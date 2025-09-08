'use client';

import { useState } from 'react';

interface CongratulationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CongratulationsModal({ isOpen, onClose }: CongratulationsModalProps) {
  const [copied, setCopied] = useState(false);
  const giftCode = "CODE-123";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(giftCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const goToShopee = () => {
    window.open('http://localhost:3000');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#00000080] bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 text-center">
          {/* Congratulations Icon */}
          <div className="mb-4">
            <svg 
              className="w-16 h-16 mx-auto text-green-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Congratulations!
          </h2>

          {/* Shopee Gift Message */}
          <p className="text-lg text-gray-700 mb-6">
            Shopee gives you <span className="font-bold text-orange-500">Giftcode 100K</span>
          </p>

          {/* Gift Code with Copy Button */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg">
              <span className="font-mono text-lg font-bold text-gray-800">{giftCode}</span>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-[#198639] text-white rounded-md hover:bg-[#15732f] transition-colors text-sm font-medium"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Visit Shopee, register an account and redeem giftcode to receive rewards
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={goToShopee}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium"
            >
              Go to Shopee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}