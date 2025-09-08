'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdvertisementHeader from '@/components/admin/advertisement/AdvertisementHeader';
import AdvertisementStatusFilter from '@/components/admin/advertisement/AdvertisementStatusFilter';
import AdvertisementActionFilter from '@/components/admin/advertisement/AdvertisementActionFilter';
import AdvertisementStatusBadge from '@/components/admin/advertisement/AdvertisementStatusBadge';
import AdvertisementSlotBadge from '@/components/admin/advertisement/AdvertisementSlotBadge';
import AdvertisementPagination from '@/components/admin/advertisement/AdvertisementPagination';

// Mock data for advertisements
const mockAdvertisements = [
  {
    id: '1',
    status: 'published',
    imageUrl: '/api/placeholder/100/100',
    adName: 'Summer Sale Banner',
    merchant: 'TechStore Pro',
    slot: 'header',
    order: 1,
    duration: '30 days',
    impressions: 15420,
    clicks: 342,
    ctr: '2.22%',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  {
    id: '2',
    status: 'published',
    imageUrl: '/api/placeholder/100/100',
    adName: 'Black Friday Special',
    merchant: 'Fashion Hub',
    slot: 'sidebar',
    order: 2,
    duration: '14 days',
    impressions: 8750,
    clicks: 198,
    ctr: '2.26%',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
  },
  {
    id: '3',
    status: 'draft',
    imageUrl: '/api/placeholder/100/100',
    adName: 'New Product Launch',
    merchant: 'Home Essentials',
    slot: 'footer',
    order: 1,
    duration: '21 days',
    impressions: 0,
    clicks: 0,
    ctr: '0.00%',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  {
    id: '4',
    status: 'archived',
    imageUrl: '/api/placeholder/100/100',
    adName: 'Holiday Collection',
    merchant: 'Style Store',
    slot: 'content',
    order: 3,
    duration: '45 days',
    impressions: 23100,
    clicks: 567,
    ctr: '2.45%',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
  },
  {
    id: '5',
    status: 'trash',
    imageUrl: '/api/placeholder/100/100',
    adName: 'Expired Promotion',
    merchant: 'Old Shop',
    slot: 'popup',
    order: 1,
    duration: '7 days',
    impressions: 1250,
    clicks: 12,
    ctr: '0.96%',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
  },
];

export default function AdvertisementsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [slotFilter, setSlotFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const statusCounts = {
    all: mockAdvertisements.length,
    published: mockAdvertisements.filter(ad => ad.status === 'published').length,
    draft: mockAdvertisements.filter(ad => ad.status === 'draft').length,
    archived: mockAdvertisements.filter(ad => ad.status === 'archived').length,
    trash: mockAdvertisements.filter(ad => ad.status === 'trash').length,
  };

  const filteredAdvertisements = mockAdvertisements.filter(ad => {
    const matchesStatus = selectedStatus === 'all' || ad.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      ad.adName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAdvertisements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAdvertisements = filteredAdvertisements.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    if (selectedAds.length === paginatedAdvertisements.length) {
      setSelectedAds([]);
    } else {
      setSelectedAds(paginatedAdvertisements.map(ad => ad.id));
    }
  };

  const handleSelectAd = (adId: string) => {
    if (selectedAds.includes(adId)) {
      setSelectedAds(selectedAds.filter(id => id !== adId));
    } else {
      setSelectedAds([...selectedAds, adId]);
    }
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
                  checked={selectedAds.length === paginatedAdvertisements.length && paginatedAdvertisements.length > 0}
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

          {/* Advertisements List */}
          <div className="divide-y divide-gray-200">
            {paginatedAdvertisements.map((ad) => (
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
                  
                  {/* Advertisement Image */}
                  <div className="col-span-2 flex justify-center">
                    <div className="relative">
                      <Image
                        src={ad.imageUrl}
                        alt={ad.adName}
                        width={64}
                        height={48}
                        className="w-16 h-12 object-cover rounded border border-gray-200"
                      />
                      <div className="absolute -top-1 -right-1">
                        <AdvertisementStatusBadge status={ad.status} />
                      </div>
                    </div>
                  </div>

                  {/* Ad Name */}
                  <div className="col-span-2 text-center">
                    <div className="space-y-1">
                      <Link
                        href={`/admin/advertisement/${ad.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-[#A96B11] cursor-pointer"
                      >
                        {ad.adName}
                      </Link>
                      <p className="text-xs text-gray-500">ID: {ad.id}</p>
                    </div>
                  </div>

                  {/* Merchant */}
                  <div className="col-span-1 text-center">
                    <p className="text-sm text-gray-900">{ad.merchant}</p>
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
                    <p className="text-sm text-gray-700">{ad.duration}</p>
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
                      parseFloat(ad.ctr) > 2 ? 'text-green-600' : 
                      parseFloat(ad.ctr) > 1 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {ad.ctr}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredAdvertisements.length === 0 && (
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
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredAdvertisements.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}