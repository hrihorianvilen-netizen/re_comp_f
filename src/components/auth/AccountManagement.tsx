'use client';

import { useState } from 'react';
import UserProfile from './UserProfile';
import ChangePasswordForm from './ChangePasswordForm';

type TabType = 'profile' | 'password';

export default function AccountManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const tabs = [
    { id: 'profile' as TabType, name: 'Profile Settings', icon: '👤' },
    { id: 'password' as TabType, name: 'Password', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and security settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#198639] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3 text-lg">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'profile' && <UserProfile />}
            {activeTab === 'password' && <ChangePasswordForm />}
          </div>
        </div>
      </div>
    </div>
  );
}