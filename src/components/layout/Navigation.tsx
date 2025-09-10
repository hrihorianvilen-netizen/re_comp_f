'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
                  <div className="border-t border-gray-100"></div>
                  <Link href="/auth/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Login
                  </Link>
                  <Link href="/auth/signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

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
          </div>
        </div>
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </nav>
  );
}