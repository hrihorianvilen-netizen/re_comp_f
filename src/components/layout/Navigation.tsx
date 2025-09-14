'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/useAuth';

export default function Navigation() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const { data: reactQueryUser } = useUser();
  
  // Use React Query user data if available, fallback to Auth context
  const currentUser = reactQueryUser || user;

  // Helper function to get full avatar URL
  const getAvatarUrl = (avatar: string | null | undefined) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    // If it's a relative URL, prepend the API base URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://reviews-backend-2zkw.onrender.com';
    return `${baseUrl.replace('/api', '')}${avatar}`;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold" style={{ color: '#a56b00' }}>
            REVIEW
          </Link>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search merchants, products, or services..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full placeholder-gray-500 text-black focus:outline-none"
              />
            </div>
          </div>

          {/* Right side - Dropdown and Add button */}
          <div className="flex items-center space-x-4">
            {/* Dropdown - Hidden on mobile */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
              >
                <span>Tool</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Home
                  </Link>
                  <Link href="/merchants" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    All Merchants
                  </Link>
                  <Link href="/tin-tuc" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    News
                  </Link>
                  <Link href="/gift-codes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Gift Codes
                  </Link>
                </div>
              )}
            </div>

            {/* Gift Codes Button - Hidden on mobile */}
            <Link
              href="/gift-codes"
              className="hidden md:flex text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium items-center space-x-1 bg-green-600 hover:bg-green-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span>Gift Codes</span>
            </Link>

            {/* Add Button - Hidden on mobile */}
            <Link
              href="/admin"
              className="hidden md:flex text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium items-center space-x-1"
              style={{ backgroundColor: '#a56b00' }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Request More Companies</span>
            </Link>

            {/* User Avatar / Login */}
            <div className="flex items-center">
              {!loading && (
                <>
                  {currentUser ? (
                    <div className="relative">
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        {getAvatarUrl(currentUser.avatar) ? (
                          <div className="w-8 h-8 relative">
                            <Image
                              src={getAvatarUrl(currentUser.avatar) || ''}
                              alt={currentUser.displayName || currentUser.name || 'User'}
                              width={32}
                              height={32}
                              className="rounded-full border border-gray-200 object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-sm font-medium">
                              {(currentUser.displayName || currentUser.name || currentUser.email)?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="hidden sm:block text-sm font-medium">
                          {currentUser.displayName || currentUser.name || 'User'}
                        </span>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900">
                              {currentUser.displayName || currentUser.name}
                            </p>
                            <p className="text-xs text-gray-500">{currentUser.email}</p>
                          </div>
                          <Link 
                            href="/account" 
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Account Settings</span>
                          </Link>
                          <Link 
                            href="/account/reviews" 
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <span>My Reviews</span>
                          </Link>
                          <div className="border-t border-gray-100"></div>
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              logout();
                              window.location.href = '/';
                            }}
                            className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="hidden sm:block text-sm font-medium">Login</span>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {(isDropdownOpen || isUserMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setIsDropdownOpen(false);
            setIsUserMenuOpen(false);
          }}
        ></div>
      )}
    </nav>
  );
}