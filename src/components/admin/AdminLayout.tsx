'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useUser } from '@/hooks/useAuth';
import { User } from '@/types/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavChildItem {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ReactNode;
  children?: NavChildItem[];
}

const adminNavItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
      </svg>
    )
  },
  {
    name: 'Merchants',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    children: [
      { name: 'All Merchants', href: '/admin/merchants' },
      { name: 'Add Merchant', href: '/admin/merchants/new' }
    ]
  },
  {
    name: 'Communication',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    children: [
      { name: 'Reviews', href: '/admin/communication/reviews' },
      { name: 'Comments', href: '/admin/communication/comments' },
      { name: 'Reports', href: '/admin/communication/reports' }
    ]
  },
  {
    name: 'Post',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
    children: [
      { name: 'Posts', href: '/admin/posts' },
      { name: 'Add Post', href: '/admin/posts/new' },
      { name: 'Categories', href: '/admin/posts/categories' },
      { name: 'Add Categories', href: '/admin/posts/categories/new' }
    ]
  },
  {
    name: 'User',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    children: [
      { name: 'Users', href: '/admin/users' },
      { name: 'Add Users', href: '/admin/users/new' },
      { name: 'User Activities', href: '/admin/users/activities' },
      { name: 'Suspended', href: '/admin/users/suspended' }
    ]
  },
  {
    name: 'Advertisement',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    children: [
      { name: 'Advertisements', href: '/admin/advertisement' },
      { name: 'Add Advertisement', href: '/admin/advertisement/add' }
    ]
  },
  {
    name: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    children: [
      { name: 'SEO & Meta Data', href: '/admin/settings/seo' },
      { name: 'Security & Spam Control', href: '/admin/settings/security' },
      { name: 'Email & Authentication', href: '/admin/settings/email' }
    ]
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const { data: user, isLoading } = useUser();

  // Check if user is admin (you'll need to add role field to User type)
  const isAdmin = user && 'role' in user && (user as User & { role: string }).role === 'admin';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#198639]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don&apos;t have permission to access the admin panel.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-[#198639] text-white rounded-md hover:bg-[#15732f]"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
      // When collapsing, close all expanded items
      setExpandedItems([]);
    }
  };

  const toggleExpanded = (itemName: string) => {
    if (isCollapsed) return; // Don't allow expansion when sidebar is collapsed
    
    setExpandedItems(prev => 
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };


  const isChildActive = (childHref: string) => {
    return pathname === childHref;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-[#00000080] bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 inset-y-0 left-0 z-50 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-all duration-300 ease-in-out lg:translate-x-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      } flex flex-col h-screen`}>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          {!isCollapsed && (
            <Link href="/admin" className="text-[#A96B11] font-bold text-[24px]">
              REVIEW
            </Link>
          )}
          
          <button
            onClick={toggleCollapse}
            className={`hidden lg:block p-2 rounded-lg transition-colors ${
              isCollapsed ? 'bg-[#FFF8F4]' : 'hover:bg-gray-100'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.12" d="M8.4668 16.333C9.58667 16.333 10.1464 16.3339 10.5742 16.5518C10.9505 16.7435 11.2565 17.0495 11.4482 17.4258C11.6661 17.8536 11.667 18.4133 11.667 19.5332V22.4668C11.667 23.5867 11.6661 24.1464 11.4482 24.5742C11.2565 24.9505 10.9505 25.2565 10.5742 25.4482C10.1464 25.6661 9.58667 25.667 8.4668 25.667H5.53321C4.41333 25.667 3.85357 25.6661 3.42578 25.4482C3.04946 25.2565 2.74351 24.9505 2.55176 24.5742C2.33387 24.1464 2.33301 23.5867 2.33301 22.4668V19.5332C2.33301 18.4133 2.33386 17.8536 2.55176 17.4258C2.74351 17.0495 3.04946 16.7435 3.42578 16.5518C3.85357 16.3339 4.41333 16.333 5.53321 16.333H8.4668ZM22.4668 16.333C23.5867 16.333 24.1464 16.3339 24.5742 16.5518C24.9505 16.7435 25.2565 17.0495 25.4482 17.4258C25.6661 17.8536 25.667 18.4133 25.667 19.5332V22.4668C25.667 23.5867 25.6661 24.1464 25.4482 24.5742C25.2565 24.9505 24.9505 25.2565 24.5742 25.4482C24.1464 25.6661 23.5867 25.667 22.4668 25.667H19.5332C18.4133 25.667 17.8536 25.6661 17.4258 25.4482C17.0495 25.2565 16.7435 24.9505 16.5518 24.5742C16.3339 24.1464 16.333 23.5867 16.333 22.4668V19.5332C16.333 18.4133 16.3339 17.8536 16.5518 17.4258C16.7435 17.0495 17.0495 16.7435 17.4258 16.5518C17.8536 16.3339 18.4133 16.333 19.5332 16.333H22.4668ZM8.4668 2.33301C9.58667 2.33301 10.1464 2.33386 10.5742 2.55176C10.9505 2.7435 11.2565 3.04946 11.4482 3.42578C11.6661 3.85357 11.667 4.41333 11.667 5.5332V8.4668C11.667 9.58667 11.6661 10.1464 11.4482 10.5742C11.2565 10.9505 10.9505 11.2565 10.5742 11.4482C10.1464 11.6661 9.58667 11.667 8.4668 11.667H5.53321C4.41333 11.667 3.85357 11.6661 3.42578 11.4482C3.04946 11.2565 2.74351 10.9505 2.55176 10.5742C2.33386 10.1464 2.33301 9.58667 2.33301 8.4668V5.5332C2.33301 4.41333 2.33386 3.85357 2.55176 3.42578C2.74351 3.04946 3.04946 2.7435 3.42578 2.55176C3.85357 2.33386 4.41333 2.33301 5.53321 2.33301H8.4668Z" fill="#22272F"/>
              <path d="M8.46679 15.583C9.01398 15.583 9.46989 15.582 9.84081 15.6123C10.2206 15.6433 10.5779 15.7111 10.915 15.8828C11.4323 16.1464 11.8526 16.5678 12.1162 17.085C12.2879 17.422 12.3557 17.7786 12.3867 18.1582C12.417 18.5293 12.416 18.9857 12.416 19.5332V22.4668C12.416 23.014 12.417 23.4699 12.3867 23.8408C12.3557 24.2207 12.288 24.5778 12.1162 24.915C11.8526 25.4322 11.4322 25.8526 10.915 26.1162C10.5778 26.288 10.2207 26.3557 9.84081 26.3867C9.46988 26.417 9.01402 26.416 8.46679 26.416H5.5332C4.98567 26.416 4.52925 26.417 4.1582 26.3867C3.77856 26.3557 3.42202 26.2879 3.08496 26.1162C2.56776 25.8526 2.1464 25.4323 1.88281 24.915C1.71111 24.5779 1.64332 24.2206 1.6123 23.8408C1.58203 23.4699 1.583 23.014 1.583 22.4668V19.5332C1.583 18.9857 1.58198 18.5293 1.6123 18.1582C1.64334 17.7786 1.71114 17.422 1.88281 17.085C2.14644 16.5676 2.56761 16.1464 3.08496 15.8828C3.42201 15.7111 3.77858 15.6433 4.1582 15.6123C4.52925 15.582 4.98567 15.583 5.5332 15.583H8.46679ZM22.4668 15.583C23.014 15.583 23.4699 15.582 23.8408 15.6123C24.2206 15.6433 24.5779 15.7111 24.915 15.8828C25.4323 16.1464 25.8526 16.5678 26.1162 17.085C26.2879 17.422 26.3557 17.7786 26.3867 18.1582C26.417 18.5293 26.416 18.9857 26.416 19.5332V22.4668C26.416 23.014 26.417 23.4699 26.3867 23.8408C26.3557 24.2207 26.288 24.5778 26.1162 24.915C25.8526 25.4322 25.4322 25.8526 24.915 26.1162C24.5778 26.288 24.2207 26.3557 23.8408 26.3867C23.4699 26.417 23.014 26.416 22.4668 26.416H19.5332C18.9857 26.416 18.5293 26.417 18.1582 26.3867C17.7786 26.3557 17.422 26.2879 17.085 26.1162C16.5678 25.8526 16.1464 25.4323 15.8828 24.915C15.7111 24.5779 15.6433 24.2206 15.6123 23.8408C15.582 23.4699 15.583 23.014 15.583 22.4668V19.5332C15.583 18.9857 15.582 18.5293 15.6123 18.1582C15.6433 17.7786 15.7111 17.422 15.8828 17.085C16.1464 16.5676 16.5676 16.1464 17.085 15.8828C17.422 15.7111 17.7786 15.6433 18.1582 15.6123C18.5293 15.582 18.9857 15.583 19.5332 15.583H22.4668ZM5.5332 17.083C4.96095 17.083 4.57609 17.0833 4.28027 17.1074C3.99348 17.1309 3.85613 17.1736 3.76562 17.2197C3.53061 17.3395 3.33953 17.5306 3.21972 17.7656C3.1736 17.8561 3.13088 17.9935 3.10742 18.2803C3.08325 18.5761 3.083 18.961 3.083 19.5332V22.4668C3.083 23.0387 3.08329 23.423 3.10742 23.7188C3.13083 24.0053 3.17368 24.1428 3.21972 24.2334C3.3395 24.4685 3.5306 24.6604 3.76562 24.7803C3.85612 24.8264 3.99369 24.8681 4.28027 24.8916C4.57609 24.9158 4.96095 24.916 5.5332 24.916H8.46679C9.0387 24.916 9.423 24.9157 9.71874 24.8916C10.0053 24.8682 10.1428 24.8263 10.2334 24.7803C10.4686 24.6604 10.6604 24.4686 10.7803 24.2334C10.8263 24.1428 10.8682 24.0053 10.8916 23.7188C10.9157 23.423 10.916 23.0387 10.916 22.4668V19.5332C10.916 18.961 10.9158 18.5761 10.8916 18.2803C10.8681 17.9937 10.8263 17.8561 10.7803 17.7656C10.6604 17.5306 10.4685 17.3395 10.2334 17.2197C10.1428 17.1737 10.0053 17.1308 9.71874 17.1074C9.42301 17.0833 9.03865 17.083 8.46679 17.083H5.5332ZM19.5332 17.083C18.961 17.083 18.5761 17.0833 18.2803 17.1074C17.9935 17.1309 17.8561 17.1736 17.7656 17.2197C17.5306 17.3395 17.3395 17.5306 17.2197 17.7656C17.1736 17.8561 17.1309 17.9935 17.1074 18.2803C17.0832 18.5761 17.083 18.961 17.083 19.5332V22.4668C17.083 23.0387 17.0833 23.423 17.1074 23.7188C17.1308 24.0053 17.1737 24.1428 17.2197 24.2334C17.3395 24.4685 17.5306 24.6604 17.7656 24.7803C17.8561 24.8264 17.9937 24.8681 18.2803 24.8916C18.5761 24.9158 18.961 24.916 19.5332 24.916H22.4668C23.0387 24.916 23.423 24.9157 23.7187 24.8916C24.0053 24.8682 24.1428 24.8263 24.2334 24.7803C24.4686 24.6604 24.6604 24.4686 24.7803 24.2334C24.8263 24.1428 24.8682 24.0053 24.8916 23.7188C24.9157 23.423 24.916 23.0387 24.916 22.4668V19.5332C24.916 18.961 24.9158 18.5761 24.8916 18.2803C24.8681 17.9937 24.8263 17.8561 24.7803 17.7656C24.6604 17.5306 24.4685 17.3395 24.2334 17.2197C24.1428 17.1737 24.0053 17.1308 23.7187 17.1074C23.423 17.0833 23.0386 17.083 22.4668 17.083H19.5332ZM8.46679 1.58301C9.01398 1.58301 9.46989 1.58204 9.84081 1.6123C10.2206 1.64333 10.5779 1.71112 10.915 1.88281C11.4323 2.1464 11.8526 2.56777 12.1162 3.08496C12.2879 3.42203 12.3557 3.77857 12.3867 4.1582C12.417 4.52926 12.416 4.98567 12.416 5.5332V8.4668C12.416 9.01402 12.417 9.46988 12.3867 9.84082C12.3557 10.2207 12.288 10.5778 12.1162 10.915C11.8526 11.4322 11.4322 11.8526 10.915 12.1162C10.5778 12.288 10.2207 12.3557 9.84081 12.3867C9.46988 12.417 9.01402 12.416 8.46679 12.416H5.5332C4.98567 12.416 4.52925 12.417 4.1582 12.3867C3.77856 12.3557 3.42202 12.2879 3.08496 12.1162C2.56776 11.8526 2.1464 11.4323 1.88281 10.915C1.71111 10.5779 1.64332 10.2206 1.6123 9.84082C1.58203 9.4699 1.583 9.01398 1.583 8.4668V5.5332C1.583 4.98567 1.58198 4.52926 1.6123 4.1582C1.64334 3.77858 1.71114 3.42201 1.88281 3.08496C2.14644 2.56762 2.56761 2.14645 3.08496 1.88281C3.42201 1.71115 3.77858 1.64335 4.1582 1.6123C4.52925 1.58199 4.98567 1.58301 5.5332 1.58301H8.46679ZM22.4668 1.58301C23.014 1.58301 23.4699 1.58204 23.8408 1.6123C24.2206 1.64333 24.5779 1.71112 24.915 1.88281C25.4323 2.1464 25.8526 2.56777 26.1162 3.08496C26.2879 3.42203 26.3557 3.77857 26.3867 4.1582C26.417 4.52926 26.416 4.98567 26.416 5.5332V8.4668C26.416 9.01402 26.417 9.46988 26.3867 9.84082C26.3557 10.2207 26.288 10.5778 26.1162 10.915C25.8526 11.4322 25.4322 11.8526 24.915 12.1162C24.5778 12.288 24.2207 12.3557 23.8408 12.3867C23.4699 12.417 23.014 12.416 22.4668 12.416H19.5332C18.9857 12.416 18.5293 12.417 18.1582 12.3867C17.7786 12.3557 17.422 12.2879 17.085 12.1162C16.5678 11.8526 16.1464 11.4323 15.8828 10.915C15.7111 10.5779 15.6433 10.2206 15.6123 9.84082C15.582 9.4699 15.583 9.01398 15.583 8.4668V5.5332C15.583 4.98567 15.582 4.52926 15.6123 4.1582C15.6433 3.77858 15.7111 3.42201 15.8828 3.08496C16.1464 2.56762 16.5676 2.14645 17.085 1.88281C17.422 1.71115 17.7786 1.64335 18.1582 1.6123C18.5293 1.58199 18.9857 1.58301 19.5332 1.58301H22.4668ZM5.5332 3.08301C4.96095 3.08301 4.57609 3.08325 4.28027 3.10742C3.99348 3.13089 3.85613 3.17361 3.76562 3.21973C3.53061 3.33954 3.33953 3.53061 3.21972 3.76562C3.1736 3.85613 3.13088 3.99348 3.10742 4.28027C3.08325 4.5761 3.083 4.96096 3.083 5.5332V8.4668C3.083 9.03865 3.08329 9.42302 3.10742 9.71875C3.13083 10.0053 3.17369 10.1428 3.21972 10.2334C3.33949 10.4685 3.5306 10.6604 3.76562 10.7803C3.85612 10.8264 3.99369 10.8681 4.28027 10.8916C4.57609 10.9158 4.96095 10.916 5.5332 10.916H8.46679C9.0387 10.916 9.423 10.9157 9.71874 10.8916C10.0053 10.8682 10.1428 10.8263 10.2334 10.7803C10.4686 10.6604 10.6604 10.4686 10.7803 10.2334C10.8263 10.1428 10.8682 10.0053 10.8916 9.71875C10.9157 9.42301 10.916 9.0387 10.916 8.4668V5.5332C10.916 4.96096 10.9158 4.5761 10.8916 4.28027C10.8681 3.9937 10.8263 3.85613 10.7803 3.76562C10.6604 3.53061 10.4685 3.3395 10.2334 3.21973C10.1428 3.17369 10.0053 3.13083 9.71874 3.10742C9.42301 3.08329 9.03865 3.08301 8.46679 3.08301H5.5332ZM19.5332 3.08301C18.961 3.08301 18.5761 3.08325 18.2803 3.10742C17.9935 3.13089 17.8561 3.17361 17.7656 3.21973C17.5306 3.33954 17.3395 3.53061 17.2197 3.76562C17.1736 3.85613 17.1309 3.99348 17.1074 4.28027C17.0832 4.5761 17.083 4.96096 17.083 5.5332V8.4668C17.083 9.03865 17.0833 9.42302 17.1074 9.71875C17.1308 10.0053 17.1737 10.1428 17.2197 10.2334C17.3395 10.4685 17.5306 10.6604 17.7656 10.7803C17.8561 10.8264 17.9937 10.8681 18.2803 10.8916C18.5761 10.9158 18.961 10.916 19.5332 10.916H22.4668C23.0387 10.916 23.423 10.9157 23.7187 10.8916C24.0053 10.8682 24.1428 10.8263 24.2334 10.7803C24.4686 10.6604 24.6604 24.4686 24.7803 10.2334C24.8263 10.1428 24.8682 10.0053 24.8916 9.71875C24.9157 9.42301 24.916 9.0387 24.916 8.4668V5.5332C24.916 4.96096 24.9158 4.5761 24.8916 4.28027C24.8681 3.9937 24.8263 3.85613 24.7803 3.76562C24.6604 3.5306 24.4685 3.3395 24.2334 3.21973C24.1428 3.17369 24.0053 3.13083 23.7187 3.10742C23.423 3.08329 23.0386 3.08301 22.4668 3.08301H19.5332Z" fill="#22272F"/>
            </svg>
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="mt-5 px-2 pb-6">
          {adminNavItems.map((item) => {
            const isExpanded = expandedItems.includes(item.name);
            const hasChildren = item.children && item.children.length > 0;
            
            return (
              <div key={item.name}>
                {/* Main nav item */}
                <div className="flex items-center">
                  {item.href ? (
                    // Items with direct links (Dashboard)
                    <Link
                      href={item.href}
                      className="group flex items-center flex-1 px-2 py-2 text-base font-medium rounded-md mb-1 transition-colors bg-[#FFF8F4] text-[#A96B11] hover:bg-[#FFF8F4] hover:text-[#A96B11]"
                      title={isCollapsed ? item.name : ''}
                    >
                      <span className={`${isCollapsed ? '' : 'mr-4'} text-[#A96B11] transition-colors`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="transition-opacity duration-200">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  ) : (
                    // Items without direct links (only collapse/expand functionality)
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className="group flex items-center flex-1 px-2 py-2 text-base font-medium rounded-md mb-1 transition-colors text-left bg-[#FFF8F4] text-[#A96B11] hover:bg-[#FFF8F4] hover:text-[#A96B11]"
                      title={isCollapsed ? item.name : ''}
                    >
                      <span className={`${isCollapsed ? '' : 'mr-4'} text-[#A96B11] transition-colors`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="transition-opacity duration-200 flex-1">
                          {item.name}
                        </span>
                      )}
                      {!isCollapsed && hasChildren && (
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 text-[#A96B11] ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>

                {/* Children items */}
                {hasChildren && !isCollapsed && (
                  <div 
                    className={`ml-6 mb-2 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded 
                        ? 'max-h-96 opacity-100' 
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className={`transform transition-transform duration-300 ease-in-out ${
                      isExpanded ? 'translate-y-0' : '-translate-y-2'
                    }`}>
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            isChildActive(child.href)
                              ? 'bg-[#A96B11] text-white'
                              : 'text-black hover:bg-gray-50 hover:text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-center w-4 h-4 mr-3">
                            <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                              isChildActive(child.href)
                                ? 'border-white bg-white'
                                : 'border-[#A96B11]'
                            }`}>
                              {isChildActive(child.href) && (
                                <div className="w-1.5 h-1.5 rounded-full bg-[#A96B11]"></div>
                              )}
                            </div>
                          </div>
                          <span>{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#198639] lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <h1 className="text-2xl font-semibold text-gray-900">
                Admin Panel
              </h1>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              <Link
                href="/"
                target="_blank"
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#198639]"
                title="View Site"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
              
              <button className="ml-3 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#198639]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-12h5v12z" />
                </svg>
              </button>

              {/* User info */}
              <div className="ml-3 bg-white">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    <Image
                      src="/images/avatar/admin.png"
                      alt="admin"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}