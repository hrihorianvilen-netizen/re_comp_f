'use client';

import Link from 'next/link';

interface MerchantDetailHeaderProps {
  isEditMode: boolean;
  isDraft: boolean;
  merchantName: string;
  merchantStatus?: 'pending' | 'approved' | 'suspended' | 'rejected';
  onEditClick: () => void;
  onSaveClick: () => void;
  onCancelClick: () => void;
  onDiscardClick?: () => void;
  onSaveDraftClick?: () => void;
  onPublishClick?: () => void;
}

export default function MerchantDetailHeader({ 
  isEditMode, 
  isDraft,
  merchantName,
  merchantStatus,
  onEditClick,
  onSaveClick,
  onCancelClick,
  onDiscardClick,
  onSaveDraftClick,
  onPublishClick
}: MerchantDetailHeaderProps) {
  
  const getStatusBadge = () => {
    if (!merchantStatus) return null;
    
    switch (merchantStatus) {
      case 'pending':
        return (
          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-white">
            Draft
          </span>
        );
      case 'approved':
        return (
          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-400 text-white">
            Published
          </span>
        );
      case 'suspended':
      case 'rejected':
        return (
          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-400 text-white">
            Trash
          </span>
        );
      default:
        return null;
    }
  };
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
            <span className="text-gray-900">{merchantName || 'Details'}</span>
            {getStatusBadge()}
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Merchant Details</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {!isEditMode ? (
            // View mode - Show Edit button (but not for trash status)
            (merchantStatus !== 'suspended' && merchantStatus !== 'rejected') && (
              <button
                onClick={onEditClick}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors border border-[#A96B11] text-[#A96B11] hover:bg-[#A96B11] hover:text-white"
              >
                Edit
              </button>
            )
          ) : (
            // Edit mode - Show action buttons
            <>
              {merchantStatus === 'pending' ? (
                // Draft merchant - show Discard, Save Draft, Publish
                <>
                  <button
                    onClick={onDiscardClick}
                    className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-gray-500 border border-gray-300 hover:bg-gray-50"
                  >
                    Discard
                  </button>
                  <button
                    onClick={onSaveDraftClick}
                    className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 border border-gray-300 hover:bg-gray-50"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={onPublishClick}
                    className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-white bg-[#A96B11] hover:bg-[#8b5a0e]"
                  >
                    Publish
                  </button>
                </>
              ) : (
                // Published merchant - show Cancel and Save
                <>
                  <button
                    onClick={onCancelClick}
                    className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-gray-500 border border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSaveClick}
                    className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-white bg-[#A96B11] hover:bg-[#8b5a0e]"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}