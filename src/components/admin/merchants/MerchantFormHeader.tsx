'use client';

import Link from 'next/link';

interface MerchantFormHeaderProps {
  activeAction: 'discard' | 'save_draft' | 'publish' | null;
  setActiveAction: (action: 'discard' | 'save_draft' | 'publish' | null) => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onDiscard?: () => void;
  isSubmitting?: boolean;
}

export default function MerchantFormHeader({ activeAction, setActiveAction, onSaveDraft, onPublish, onDiscard, isSubmitting }: MerchantFormHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <div>
          <nav className="flex items-center text-sm text-gray-500 mb-2">
            <Link href="/admin/merchants" className="hover:text-gray-700">
              Merchant
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Draft</span>
            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-white">
              Draft
            </span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Merchant</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveAction('discard');
              onDiscard?.();
            }}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activeAction === 'discard'
                ? 'border border-[#A96B11] text-[#A96B11]'
                : 'text-gray-500 border border-gray-300'
            }`}
          >
            Discard
          </button>
          <button
            onClick={() => {
              setActiveAction('save_draft');
              onSaveDraft?.();
            }}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activeAction === 'save_draft'
                ? 'border border-[#A96B11] text-[#A96B11]'
                : 'text-gray-500 border border-gray-300'
            }`}
          >
            {isSubmitting && activeAction === 'save_draft' ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => {
              setActiveAction('publish');
              onPublish?.();
            }}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              activeAction === 'publish'
                ? 'border border-[#A96B11] text-[#A96B11]'
                : 'text-gray-500 border border-gray-300'
            }`}
          >
            {isSubmitting && activeAction === 'publish' ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}