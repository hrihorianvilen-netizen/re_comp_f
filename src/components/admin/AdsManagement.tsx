'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  useAds, 
  useDeleteAd, 
  usePublishAd, 
  useArchiveAd, 
  useRestoreAd,
  usePermanentDeleteAd 
} from '@/hooks/useAds';
import { Advertisement } from '@/types/api';
import AdvertisementHeader from '@/components/admin/advertisement/AdvertisementHeader';
import AdvertisementStatusFilter from '@/components/admin/advertisement/AdvertisementStatusFilter';
import AdvertisementActionFilter from '@/components/admin/advertisement/AdvertisementActionFilter';
import AdvertisementStatusBadge from '@/components/admin/advertisement/AdvertisementStatusBadge';
import AdvertisementSlotBadge from '@/components/admin/advertisement/AdvertisementSlotBadge';
import AdvertisementPagination from '@/components/admin/advertisement/AdvertisementPagination';

export default function AdsManagement() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [slotFilter, setSlotFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const itemsPerPage = 20;

  // Fetch ads data
  const { data, isLoading } = useAds({
    page: currentPage,
    limit: itemsPerPage,
    status: selectedStatus === 'all' ? undefined : selectedStatus as 'draft' | 'published' | 'archive' | 'trash',
    slot: slotFilter ? slotFilter as 'top' | 'sidebar' | 'footer' | 'inline' : undefined,
  });

  const deleteAdMutation = useDeleteAd();
  const publishAdMutation = usePublishAd();
  const archiveAdMutation = useArchiveAd();
  const restoreAdMutation = useRestoreAd();
  const permanentDeleteMutation = usePermanentDeleteAd();

  // Calculate status counts
  const statusCounts = {
    all: data?.total || 0,
    published: data?.ads.filter(ad => ad.status === 'published').length || 0,
    draft: data?.ads.filter(ad => ad.status === 'draft').length || 0,
    archived: data?.ads.filter(ad => ad.status === 'archive').length || 0,
    trash: data?.ads.filter(ad => ad.status === 'trash').length || 0,
  };

  // Filter ads based on search
  const filteredAdvertisements = data?.ads.filter(ad => {
    const matchesSearch = searchQuery === '' || 
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.merchant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSlot = !slotFilter || ad.slot === slotFilter;
    return matchesSearch && matchesSlot;
  }) || [];

  const handleSelectAll = () => {
    if (selectedAds.length === filteredAdvertisements.length) {
      setSelectedAds([]);
    } else {
      setSelectedAds(filteredAdvertisements.map(ad => ad.id));
    }
  };

  const handleSelectAd = (adId: string) => {
    if (selectedAds.includes(adId)) {
      setSelectedAds(selectedAds.filter(id => id !== adId));
    } else {
      setSelectedAds([...selectedAds, adId]);
    }
  };

  const handleStatusChange = async (ad: Advertisement, action: 'publish' | 'archive' | 'restore' | 'delete' | 'permanent') => {
    try {
      switch (action) {
        case 'publish':
          await publishAdMutation.mutateAsync(ad.id);
          break;
        case 'archive':
          await archiveAdMutation.mutateAsync(ad.id);
          break;
        case 'restore':
          await restoreAdMutation.mutateAsync(ad.id);
          break;
        case 'delete':
          await deleteAdMutation.mutateAsync(ad.id);
          break;
        case 'permanent':
          await permanentDeleteMutation.mutateAsync(ad.id);
          setShowDeleteModal(null);
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} ad:`, error);
    }
  };

  const formatDuration = (ad: Advertisement) => {
    const start = new Date(ad.startDate);
    const end = new Date(ad.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} days`;
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdvertisementHeader
          title="Advertisements"
          addButtonText="Add Advertisement"
          addButtonHref="/admin/advertisement/new"
        />

        <AdvertisementStatusFilter
          selectedStatus={selectedStatus}
          statusCounts={statusCounts}
          searchQuery={searchQuery}
          onStatusChange={setSelectedStatus}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search advertisements"
        />

        <AdvertisementActionFilter
          actionFilter={actionFilter}
          slotFilter={slotFilter}
          timeFilter={timeFilter}
          onActionChange={setActionFilter}
          onSlotChange={setSlotFilter}
          onTimeChange={setTimeFilter}
          filteredCount={filteredAdvertisements.length}
        />

        {/* Advertisements List Section */}
        <div className="bg-white shadow rounded-lg">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1 flex justify-center">
                <input
                  type="checkbox"
                  checked={selectedAds.length === filteredAdvertisements.length && filteredAdvertisements.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                />
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Advertisement</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Ad Name</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Merchant</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Slot</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Order</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Duration</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Impr.</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Click</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">CTR</div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">Loading advertisements...</p>
            </div>
          )}

          {/* Advertisements List */}
          {!isLoading && (
            <div className="divide-y divide-gray-200">
              {filteredAdvertisements.map((ad) => (
                <div key={ad.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Checkbox */}
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        checked={selectedAds.includes(ad.id)}
                        onChange={() => handleSelectAd(ad.id)}
                        className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                      />
                    </div>
                    
                    {/* Advertisement Image & Status */}
                    <div className="col-span-2 flex justify-center">
                      <div className="relative">
                        {ad.imageUrl ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ad.imageUrl}
                              alt={ad.title}
                              className="w-16 h-12 object-cover rounded border border-gray-200"
                            />
                          </>
                        ) : (
                          <div className="w-16 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1">
                          <AdvertisementStatusBadge status={ad.status} />
                        </div>
                      </div>
                    </div>

                    {/* Ad Name with Actions */}
                    <div className="col-span-2 text-center">
                      <div className="space-y-1">
                        <Link
                          href={`/admin/advertisement/${ad.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-[#A96B11] cursor-pointer"
                        >
                          {ad.title}
                        </Link>
                        <div className="flex justify-center gap-2 text-xs">
                          <Link
                            href={`/admin/advertisement/${ad.id}/edit`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </Link>
                          {ad.status === 'draft' && (
                            <button
                              onClick={() => handleStatusChange(ad, 'publish')}
                              className="text-green-600 hover:text-green-800"
                            >
                              Publish
                            </button>
                          )}
                          {ad.status === 'published' && (
                            <button
                              onClick={() => handleStatusChange(ad, 'archive')}
                              className="text-yellow-600 hover:text-yellow-800"
                            >
                              Archive
                            </button>
                          )}
                          {ad.status === 'trash' ? (
                            <>
                              <button
                                onClick={() => handleStatusChange(ad, 'restore')}
                                className="text-green-600 hover:text-green-800"
                              >
                                Restore
                              </button>
                              <button
                                onClick={() => setShowDeleteModal(ad.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(ad, 'delete')}
                              className="text-red-600 hover:text-red-800"
                            >
                              Trash
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Merchant */}
                    <div className="col-span-1 text-center">
                      <p className="text-sm text-gray-900">
                        {ad.merchant ? ad.merchant.name : 'Platform'}
                      </p>
                    </div>

                    {/* Slot */}
                    <div className="col-span-1 flex justify-center">
                      <AdvertisementSlotBadge slot={ad.slot} />
                    </div>

                    {/* Order */}
                    <div className="col-span-1 flex justify-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        {ad.order}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="col-span-1 text-center">
                      <p className="text-sm text-gray-700">{formatDuration(ad)}</p>
                    </div>

                    {/* Impressions */}
                    <div className="col-span-1 text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {ad.impressions.toLocaleString()}
                      </p>
                    </div>

                    {/* Clicks */}
                    <div className="col-span-1 text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {ad.clicks.toLocaleString()}
                      </p>
                    </div>

                    {/* CTR */}
                    <div className="col-span-1 text-center">
                      <p className={`text-sm font-medium ${
                        ad.ctr > 2 ? 'text-green-600' : 
                        ad.ctr > 1 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {ad.ctr.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empty State */}
        {!isLoading && filteredAdvertisements.length === 0 && (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No advertisements found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}

        <AdvertisementPagination
          currentPage={currentPage}
          totalPages={data?.totalPages || 1}
          onPageChange={setCurrentPage}
          totalItems={data?.total || 0}
          itemsPerPage={itemsPerPage}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Permanently Delete Ad?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                This action cannot be undone. The ad and all its metrics will be permanently deleted.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusChange({ id: showDeleteModal } as Advertisement, 'permanent')}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}