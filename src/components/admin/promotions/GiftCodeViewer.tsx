'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface GiftCodeDetails {
  totalCodes: number;
  totalClaims: number;
  remainingCodes: number;
  usageRate: number;
  codes: string[];
  codesWithStatus: Array<{
    code: string;
    isUsed: boolean;
    claim: {
      id: string;
      userEmail: string | null;
      displayName: string | null;
      claimedAt: string;
      ipAddress: string | null;
    } | null;
  }>;
  claims: Array<{
    id: string;
    userEmail: string | null;
    displayName: string | null;
    claimedCode: string | null;
    claimedAt: string;
    ipAddress: string | null;
  }>;
  claimedEmails: string[];
  claimedCodes: string[];
}

interface GiftCodeViewerProps {
  promotionId: string;
  promotionTitle: string;
  onClose: () => void;
}

export default function GiftCodeViewer({ promotionId, promotionTitle, onClose }: GiftCodeViewerProps) {
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<GiftCodeDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'codes' | 'claims'>('overview');

  useEffect(() => {
    fetchGiftCodeDetails();
  }, [promotionId]);

  const fetchGiftCodeDetails = async () => {
    try {
      const response = await api.get<{
        giftCodeDetails: GiftCodeDetails;
      }>(`/admin/promotions/${promotionId}/giftcodes`);

      if (response.data?.giftCodeDetails) {
        setDetails(response.data.giftCodeDetails);
      }
    } catch (error) {
      console.error('Error fetching gift code details:', error);
      toast.error('Failed to load gift code details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#00000080]">
        <div className="text-white rounded-lg p-6 flex flex-col items-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          <p>Loading gift code details...</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-[#00000080]">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Gift Code Details</h2>
              <p className="text-gray-600 mt-1">{promotionTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mt-6 border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-1 ${
                activeTab === 'overview'
                  ? 'border-b-2 border-[#A96B11] text-[#A96B11]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('codes')}
              className={`pb-3 px-1 ${
                activeTab === 'codes'
                  ? 'border-b-2 border-[#A96B11] text-[#A96B11]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Codes ({details.totalCodes})
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`pb-3 px-1 ${
                activeTab === 'claims'
                  ? 'border-b-2 border-[#A96B11] text-[#A96B11]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Claims ({details.totalClaims})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Codes</p>
                  <p className="text-2xl font-semibold mt-1">{details.totalCodes}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Claims</p>
                  <p className="text-2xl font-semibold mt-1 text-blue-600">{details.totalClaims}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className="text-2xl font-semibold mt-1 text-green-600">{details.remainingCodes}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Usage Rate</p>
                  <p className="text-2xl font-semibold mt-1 text-purple-600">{details.usageRate}%</p>
                </div>
              </div>

              {/* Usage Bar */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Usage Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-[#A96B11] h-4 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, details.usageRate)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {details.totalClaims} of {details.totalCodes} codes have been claimed
                </p>
              </div>

              {/* Recent Claims */}
              {details.claims.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Claims</h3>
                  <div className="space-y-2">
                    {details.claims.slice(0, 5).map(claim => (
                      <div key={claim.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                        <div>
                          <p className="font-medium">{claim.displayName || claim.userEmail || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(claim.claimedAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">{claim.ipAddress || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'codes' && (
            <div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Total: {details.totalCodes} codes | Claimed: {details.totalClaims} | Available: {details.remainingCodes}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                {details.codesWithStatus && details.codesWithStatus.length > 0 ? (
                  <div className="space-y-2">
                    <div className="max-h-96 overflow-y-auto">
                      {details.codesWithStatus.map((item, index) => (
                        <div
                          key={index}
                          className={`flex justify-between items-center p-2 rounded ${
                            item.isUsed
                              ? 'bg-red-50 text-gray-500'
                              : 'bg-green-50 text-gray-700'
                          }`}
                        >
                          <span className={`font-mono text-sm ${item.isUsed ? 'line-through' : ''}`}>
                            {item.code}
                          </span>
                          <div className="flex items-center gap-2">
                            {item.isUsed ? (
                              <>
                                <span className="text-xs text-red-600 font-medium">Used</span>
                                {item.claim && (
                                  <span className="text-xs text-gray-500">
                                    by {item.claim.displayName || item.claim.userEmail || 'Unknown'}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-green-600 font-medium">Available</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : details.codes && details.codes.length > 0 ? (
                  // Fallback to old display if codesWithStatus is not available
                  <div className="space-y-2">
                    <div className="max-h-96 overflow-y-auto">
                      {details.codes.map((code, index) => (
                        <div
                          key={index}
                          className={`flex justify-between items-center p-2 ${
                            index < details.totalClaims
                              ? 'line-through text-gray-400'
                              : 'text-gray-700'
                          }`}
                        >
                          <span className="font-mono text-sm">{code}</span>
                          {index < details.totalClaims && (
                            <span className="text-xs text-red-500 ml-2">Used</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No gift codes available</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'claims' && (
            <div>
              {details.claims.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claimed At</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {details.claims.map(claim => (
                        <tr key={claim.id}>
                          <td className="px-4 py-3 text-sm">
                            <div>
                              <p className="font-medium">{claim.displayName || 'Anonymous'}</p>
                              {claim.userEmail && (
                                <p className="text-xs text-gray-500">{claim.userEmail}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {claim.claimedCode || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(claim.claimedAt).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {claim.ipAddress || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No claims yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}