'use client';

import { useState } from 'react';
import moment from 'moment';

// Mock data for user activities
const mockActivities = [
  {
    id: '1',
    user: 'john_doe',
    ipClaimed: '192.168.1.100',
    promotionTitle: 'Summer Flash Sale',
    type: 'discount',
    merchant: 'TechStore Pro',
    claimTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    code: 'SUMMER2024'
  },
  {
    id: '2',
    user: 'jane_smith',
    ipClaimed: '192.168.1.101',
    promotionTitle: 'Free Shipping Weekend',
    type: 'shipping',
    merchant: 'Fashion Hub',
    claimTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    code: 'FREESHIP'
  },
  {
    id: '3',
    user: 'mike_wilson',
    ipClaimed: '192.168.1.102',
    promotionTitle: 'Buy 2 Get 1 Free',
    type: 'bogo',
    merchant: 'Home Essentials',
    claimTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    code: 'B2G1FREE'
  },
  {
    id: '4',
    user: 'sarah_davis',
    ipClaimed: '192.168.1.103',
    promotionTitle: 'Early Bird Special',
    type: 'discount',
    merchant: 'Style Store',
    claimTime: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    code: 'EARLY50'
  },
  {
    id: '5',
    user: 'tom_brown',
    ipClaimed: '192.168.1.104',
    promotionTitle: 'Loyalty Reward',
    type: 'cashback',
    merchant: 'Electronics Plus',
    claimTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    code: 'LOYAL25'
  },
];

export default function UserActivitiesPage() {
  const [filters, setFilters] = useState({
    userType: 'all',
    userOrIp: '',
    merchantSearch: '',
    promotion: '',
    promotionType: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    console.log('Filtering with:', filters);
    setCurrentPage(1);
  };

  const filteredActivities = mockActivities.filter(activity => {
    const matchesUserOrIp = filters.userOrIp === '' || 
      activity.user.toLowerCase().includes(filters.userOrIp.toLowerCase()) ||
      activity.ipClaimed.includes(filters.userOrIp);
    
    const matchesMerchant = filters.merchantSearch === '' ||
      activity.merchant.toLowerCase().includes(filters.merchantSearch.toLowerCase());
    
    const matchesPromotion = filters.promotion === '' ||
      activity.promotionTitle.toLowerCase().includes(filters.promotion.toLowerCase());
    
    const matchesPromotionType = filters.promotionType === 'all' ||
      activity.type === filters.promotionType;

    return matchesUserOrIp && matchesMerchant && matchesPromotion && matchesPromotionType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'discount': 'bg-green-100 text-green-800',
      'shipping': 'bg-blue-100 text-blue-800',
      'bogo': 'bg-purple-100 text-purple-800',
      'cashback': 'bg-orange-100 text-orange-800'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gift Claimants List</h1>
        </div>

        {/* Filters Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="grid grid-cols-7 gap-4 mb-4 items-center justify-between">
              {/* User Type Dropdown */}
              <div>
                <select
                  id="userType"
                  value={filters.userType}
                  onChange={(e) => handleFilterChange('userType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11] text-sm"
                >
                  <option value="all">All Users</option>
                  <option value="regular">Regular</option>
                  <option value="premium">Premium</option>
                  <option value="merchant">Merchant</option>
                </select>
              </div>

              {/* User or IP Field */}
              <div>
                <input
                  type="text"
                  id="userOrIp"
                  value={filters.userOrIp}
                  onChange={(e) => handleFilterChange('userOrIp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11] text-sm"
                  placeholder="Enter user or IP"
                />
              </div>

              {/* Merchants Search Field */}
              <div>
                <input
                  type="text"
                  id="merchantSearch"
                  value={filters.merchantSearch}
                  onChange={(e) => handleFilterChange('merchantSearch', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11] text-sm"
                  placeholder="Search merchants"
                />
              </div>

              {/* Promotion Field */}
              <div>
                <input
                  type="text"
                  id="promotion"
                  value={filters.promotion}
                  onChange={(e) => handleFilterChange('promotion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11] text-sm"
                  placeholder="Search promotions"
                />
              </div>

              {/* Promotion Type Dropdown */}
              <div>
                <select
                  id="promotionType"
                  value={filters.promotionType}
                  onChange={(e) => handleFilterChange('promotionType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11] text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="discount">Discount</option>
                  <option value="shipping">Free Shipping</option>
                  <option value="bogo">Buy One Get One</option>
                  <option value="cashback">Cashback</option>
                </select>
              </div>

              {/* Filter & Search Button */}
              <div>
                <button
                  onClick={handleSearch}
                  className="w-full px-4 py-2 bg-[#A96B11] text-white text-sm font-medium rounded-md hover:bg-[#8B5A0F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11]"
                >
                  Filter & Search
                </button>
              </div>
              {/* Filtered Items Count */}
              <div className="text-sm text-gray-600">
                {filteredActivities.length} items
              </div>
            </div>

          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white shadow rounded-lg">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">User</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">IP Claimed</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Promotion Title</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Type</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Merchant</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Claim Time</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Code</div>
            </div>
          </div>

          {/* Activities List */}
          <div className="divide-y divide-gray-200">
            {paginatedActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* User */}
                  <div className="col-span-2 text-center">
                    <div className="text-sm font-medium text-gray-900">{activity.user}</div>
                  </div>

                  {/* IP Claimed */}
                  <div className="col-span-2 text-center">
                    <div className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                      {activity.ipClaimed}
                    </div>
                  </div>

                  {/* Promotion Title */}
                  <div className="col-span-2 text-center">
                    <div className="text-sm font-medium text-gray-900">{activity.promotionTitle}</div>
                  </div>

                  {/* Type */}
                  <div className="col-span-1 flex justify-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}>
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    </span>
                  </div>

                  {/* Merchant */}
                  <div className="col-span-2 text-center">
                    <div className="text-sm text-gray-900">{activity.merchant}</div>
                  </div>

                  {/* Claim Time */}
                  <div className="col-span-2 text-center">
                    <div className="text-sm text-gray-600">
                      {moment(activity.claimTime).format('HH:mm:ss DD/MM/YYYY')}
                    </div>
                  </div>

                  {/* Code */}
                  <div className="col-span-1 text-center">
                    <div className="text-sm font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border">
                      {activity.code}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredActivities.length === 0 && (
          <div className="text-center py-12 bg-white shadow rounded-lg mt-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activities found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white shadow rounded-lg mt-6 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredActivities.length)} of {filteredActivities.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        page === currentPage
                          ? 'bg-[#A96B11] text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}