'use client';

import { useState } from 'react';
import moment from 'moment';

// Mock data for suspended users
const mockSuspendedUsers = [
  {
    id: '1',
    info: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      ip: '192.168.1.100',
      userId: 'john_doe'
    },
    type: 'Account',
    blockedDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    blockedBy: 'Admin User'
  },
  {
    id: '2',
    info: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      ip: '192.168.1.101',
      userId: 'jane_smith'
    },
    type: 'IP Address',
    blockedDate: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    blockedBy: 'Moderator'
  },
  {
    id: '3',
    info: {
      name: 'Mike Wilson',
      email: 'mike.wilson@example.com',
      ip: '192.168.1.102',
      userId: 'mike_wilson'
    },
    type: 'Email',
    blockedDate: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
    blockedBy: 'Admin User'
  },
  {
    id: '4',
    info: {
      name: 'Sarah Davis',
      email: 'sarah.davis@example.com',
      ip: '192.168.1.103',
      userId: 'sarah_davis'
    },
    type: 'Account',
    blockedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    blockedBy: 'System'
  },
  {
    id: '5',
    info: {
      name: 'Tom Brown',
      email: 'tom.brown@example.com',
      ip: '192.168.1.104',
      userId: 'tom_brown'
    },
    type: 'IP Address',
    blockedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    blockedBy: 'Admin User'
  },
];

export default function SuspendedPage() {
  const [filters, setFilters] = useState({
    searchByIp: '',
    searchByEmail: '',
    action: '',
    timeFilter: '',
    searchQuery: ''
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
    console.log('Searching with filters:', filters);
    setCurrentPage(1);
  };

  const handleApply = () => {
    console.log('Applying action:', filters.action);
  };

  const filteredUsers = mockSuspendedUsers.filter(user => {
    const matchesEmailOrIp = filters.searchByEmail === '' ||
      user.info.email.toLowerCase().includes(filters.searchByEmail.toLowerCase()) ||
      user.info.ip.includes(filters.searchByEmail);
    
    const matchesSearch = filters.searchQuery === '' ||
      user.info.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      user.info.email.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      user.info.userId.toLowerCase().includes(filters.searchQuery.toLowerCase());

    return matchesEmailOrIp && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'Account': 'bg-red-100 text-red-800',
      'IP Address': 'bg-yellow-100 text-yellow-800',
      'Email': 'bg-blue-100 text-blue-800'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Suspended Users</h1>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={filters.searchByEmail}
                  onChange={(e) => handleFilterChange('searchByEmail', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11] text-sm"
                  placeholder="email or ip"
                />
                <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600">
                  Suspended
                </button>
              </div>
            </div>

            {/* Status Filter Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left - Action, Date Filter, Search */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Action Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  >
                    <option value="">Action</option>
                    <option value="unsuspend">Unsuspend</option>
                    <option value="delete">Delete</option>
                    <option value="extend">Extend Suspension</option>
                  </select>
                  <button
                    onClick={handleApply}
                    className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <span className="text-gray-400">|</span>

                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.timeFilter}
                    onChange={(e) => handleFilterChange('timeFilter', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  />
                  <button className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors">
                    Filter
                  </button>
                </div>

                <span className="text-gray-400">|</span>

                {/* Search */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                    placeholder="Search by name, email and user"
                  />
                  <button
                    onClick={handleSearch}
                    className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Right - Filtered Items Count */}
              <div className="text-sm text-gray-600">
                {filteredUsers.length} items
              </div>
            </div>

          </div>
        </div>

        {/* Suspended Users List */}
        <div className="bg-white shadow rounded-lg">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1 flex justify-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                />
              </div>
              <div className="col-span-4 text-sm font-medium text-gray-700 text-center">Info</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Type</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Blocked Date</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Blocked By</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">
                <svg className="w-5 h-5 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Checkbox */}
                  <div className="col-span-1 flex justify-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                  </div>

                  {/* Info */}
                  <div className="col-span-4 text-center">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">{user.info.name}</div>
                      <div className="text-sm text-gray-600">{user.info.email}</div>
                      <div className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded inline-block">
                        {user.info.ip}
                      </div>
                      <div className="text-xs text-gray-500">ID: {user.info.userId}</div>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="col-span-2 flex justify-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(user.type)}`}>
                      {user.type}
                    </span>
                  </div>

                  {/* Blocked Date */}
                  <div className="col-span-2 text-center">
                    <div className="text-sm text-gray-900">
                      {moment(user.blockedDate).format('HH:mm:ss DD/MM/YYYY')}
                    </div>
                  </div>

                  {/* Blocked By */}
                  <div className="col-span-2 text-center">
                    <div className="text-sm text-gray-900">{user.blockedBy}</div>
                  </div>

                  {/* Locked Key Icon */}
                  <div className="col-span-1 flex justify-center">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white shadow rounded-lg mt-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No suspended users found</h3>
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

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