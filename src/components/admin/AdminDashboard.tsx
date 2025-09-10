'use client';

import { useMerchants, useReviews } from '@/hooks/useMerchants';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: merchantsData } = useMerchants({ limit: 1 });
  const { data: reviewsData } = useReviews({ limit: 1 });
  
  // Mock data for demonstration
  const stats = {
    totalMerchants: merchantsData?.pagination?.total || 0,
    totalReviews: reviewsData?.pagination?.total || 0,
    totalComments: 156, // Mock data
    totalUsers: 1234, // Mock data
    pendingReviews: 23, // Mock data
    flaggedComments: 5, // Mock data
  };

  const recentActivities = [
    { id: 1, type: 'review', message: 'New review submitted for "Tech Store"', time: '5 minutes ago' },
    { id: 2, type: 'comment', message: 'Comment flagged for inappropriate content', time: '15 minutes ago' },
    { id: 3, type: 'user', message: 'New user registered: john.doe@email.com', time: '1 hour ago' },
    { id: 4, type: 'merchant', message: 'Merchant "Fashion Hub" updated their profile', time: '2 hours ago' },
    { id: 5, type: 'review', message: 'Review approved for "Book Store"', time: '3 hours ago' },
  ];

  const quickActions = [
    { title: 'Review Pending Reviews', href: '/admin/communication/reviews', icon: '⭐', count: stats.pendingReviews },
    { title: 'Moderate Comments', href: '/admin/communication/comments', icon: '💬', count: stats.flaggedComments },
    { title: 'Manage Merchants', href: '/admin/merchants', icon: '🏪', count: stats.totalMerchants },
    { title: 'User Management', href: '/admin/users', icon: '👥', count: stats.totalUsers },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here&apos;s what&apos;s happening on your platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Total Merchants</h3>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.totalMerchants.toLocaleString()}</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏪</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Total Reviews</h3>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.totalReviews.toLocaleString()}</div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">+8% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Total Comments</h3>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.totalComments.toLocaleString()}</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">+15% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers.toLocaleString()}</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">+5% from last month</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#198639] hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{action.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{action.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-[#198639] text-white text-xs px-2 py-1 rounded-full">
                    {action.count}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {activity.type === 'review' && <span className="text-sm">⭐</span>}
                  {activity.type === 'comment' && <span className="text-sm">💬</span>}
                  {activity.type === 'user' && <span className="text-sm">👤</span>}
                  {activity.type === 'merchant' && <span className="text-sm">🏪</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/admin/activity"
              className="text-sm text-[#198639] font-medium hover:text-[#15732f]"
            >
              View all activity →
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="mt-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Attention Required</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You have {stats.pendingReviews} pending reviews and {stats.flaggedComments} flagged comments that need your attention.</p>
              </div>
              <div className="mt-4">
                <div className="flex space-x-4">
                  <Link
                    href="/admin/communication/reviews"
                    className="text-sm bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md hover:bg-yellow-200"
                  >
                    Review Pending
                  </Link>
                  <Link
                    href="/admin/communication/comments"
                    className="text-sm bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md hover:bg-yellow-200"
                  >
                    Moderate Comments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}