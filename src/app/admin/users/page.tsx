'use client';

import { useState } from 'react';
import moment from 'moment';
import Link from 'next/link';

// Mock data for users
const mockUsers = [
  {
    id: 'USR001',
    displayName: 'John Smith',
    type: 'customer',
    email: 'john.smith@email.com',
    phoneNumber: '+1 (555) 123-4567',
    registerDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'active'
  },
  {
    id: 'USR002',
    displayName: 'Sarah Wilson',
    type: 'merchant',
    email: 'sarah.wilson@store.com',
    phoneNumber: '+1 (555) 987-6543',
    registerDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
    lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    status: 'active'
  },
  {
    id: 'USR003',
    displayName: 'Mike Johnson',
    type: 'admin',
    email: 'mike.johnson@admin.com',
    phoneNumber: '+1 (555) 456-7890',
    registerDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), // 200 days ago
    lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    status: 'active'
  },
  {
    id: 'USR004',
    displayName: 'Emily Davis',
    type: 'customer',
    email: 'emily.davis@email.com',
    phoneNumber: '+1 (555) 234-5678',
    registerDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    lastLogin: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    status: 'inactive'
  },
  {
    id: 'USR005',
    displayName: 'David Brown',
    type: 'merchant',
    email: 'david.brown@shop.com',
    phoneNumber: '+1 (555) 345-6789',
    registerDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    status: 'suspended'
  },
  {
    id: 'USR006',
    displayName: 'Lisa Anderson',
    type: 'customer',
    email: 'lisa.anderson@email.com',
    phoneNumber: '+1 (555) 567-8901',
    registerDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    lastLogin: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    status: 'deleted'
  },
];

export default function UsersPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [registerDateFilter, setRegisterDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const statusCounts = {
    all: mockUsers.length,
    active: mockUsers.filter(user => user.status === 'active').length,
    inactive: mockUsers.filter(user => user.status === 'inactive').length,
    suspended: mockUsers.filter(user => user.status === 'suspended').length,
    deleted: mockUsers.filter(user => user.status === 'deleted').length,
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: '#4b8eff', bg: 'bg-blue-50', text: 'text-blue-700' },
      inactive: { color: '#999999', bg: 'bg-gray-50', text: 'text-gray-700' },
      suspended: { color: '#ff553e', bg: 'bg-red-50', text: 'text-red-700' },
      deleted: { color: '#dc2626', bg: 'bg-red-50', text: 'text-red-700' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span 
          className="w-2 h-2 rounded-full mr-1.5" 
          style={{ backgroundColor: config.color }}
        ></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getUserTypeBadge = (type: string) => {
    const typeConfig = {
      customer: 'bg-green-100 text-green-800',
      merchant: 'bg-purple-100 text-purple-800',
      admin: 'bg-orange-100 text-orange-800'
    };

    const badgeClass = typeConfig[type as keyof typeof typeConfig] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const formatDateTime = (date: Date) => {
    return moment(date).format('HH:mm:ss DD/MM/YYYY');
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">Users</h1>
          <Link
            href="/admin/users/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A96B11] hover:bg-[#8b5a0e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11] transition-colors"
          >
            New User
          </Link>
        </div>

        {/* First Status Filter Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Status Filter Tabs - Left */}
              <div className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    selectedStatus === 'all'
                      ? 'text-[#A96B11] border-b-2 border-[#A96B11]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All <span className="text-gray-500">({statusCounts.all})</span>
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => setSelectedStatus('active')}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    selectedStatus === 'active'
                      ? 'text-[#A96B11] border-b-2 border-[#A96B11]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Active <span className="text-gray-500">({statusCounts.active})</span>
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => setSelectedStatus('inactive')}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    selectedStatus === 'inactive'
                      ? 'text-[#A96B11] border-b-2 border-[#A96B11]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Inactive <span className="text-gray-500">({statusCounts.inactive})</span>
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => setSelectedStatus('suspended')}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    selectedStatus === 'suspended'
                      ? 'text-[#A96B11] border-b-2 border-[#A96B11]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Suspended <span className="text-gray-500">({statusCounts.suspended})</span>
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => setSelectedStatus('deleted')}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    selectedStatus === 'deleted'
                      ? 'text-[#A96B11] border-b-2 border-[#A96B11]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Deleted <span className="text-gray-500">({statusCounts.deleted})</span>
                </button>
              </div>

              {/* Search - Right */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search users"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none"
                />
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11] transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Second Filter Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left - Action, User Type, Register Date, Status Filters */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Action Dropdown */}
                <div className="flex items-center gap-2">
                  <select 
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  >
                    <option value="">Action</option>
                    <option value="activate">Activate</option>
                    <option value="deactivate">Deactivate</option>
                    <option value="suspend">Suspend</option>
                    <option value="delete">Delete</option>
                    <option value="reset_password">Reset Password</option>
                  </select>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <span className="text-gray-400">|</span>

                {/* User Type Dropdown */}
                <div className="flex items-center gap-2">
                  <select 
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="customer">Customer</option>
                    <option value="merchant">Merchant</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <span className="text-gray-400">|</span>

                {/* Register Date Dropdown */}
                <div className="flex items-center gap-2">
                  <select 
                    value={registerDateFilter}
                    onChange={(e) => setRegisterDateFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">Last 3 Months</option>
                    <option value="year">This Year</option>
                  </select>
                </div>

                <span className="text-gray-400">|</span>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="deleted">Deleted</option>
                  </select>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors"
                  >
                    Filter
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

        {/* Users List Section */}
        <div className="bg-white shadow rounded-lg">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1 flex justify-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                />
              </div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">User ID</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Display Name</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Type</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Email</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Phone Number</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Register Date</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Last Login</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Status</div>
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
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                  </div>
                  
                  {/* User ID */}
                  <div className="col-span-1 text-center">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-[#A96B11] cursor-pointer"
                    >
                      {user.id}
                    </Link>
                  </div>

                  {/* Display Name */}
                  <div className="col-span-2 text-center">
                    <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                  </div>

                  {/* Type */}
                  <div className="col-span-1 flex justify-center">
                    {getUserTypeBadge(user.type)}
                  </div>

                  {/* Email */}
                  <div className="col-span-2 text-center">
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>

                  {/* Phone Number */}
                  <div className="col-span-1 text-center">
                    <p className="text-sm text-gray-900">{user.phoneNumber}</p>
                  </div>

                  {/* Register Date */}
                  <div className="col-span-2 text-center">
                    <p className="text-sm text-gray-900">{formatDateTime(user.registerDate)}</p>
                  </div>

                  {/* Last Login */}
                  <div className="col-span-1 text-center">
                    <p className="text-sm text-gray-900">{formatDateTime(user.lastLogin)}</p>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex justify-center">
                    {getStatusBadge(user.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
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
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === index + 1
                        ? 'bg-[#A96B11] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
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