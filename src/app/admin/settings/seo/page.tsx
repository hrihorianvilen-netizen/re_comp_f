'use client';

import { useState } from 'react';
import AdminHeader from '@/components/admin/shared/AdminHeader';

interface SEOSettings {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  defaultMetaTitle: string;
  defaultMetaDescription: string;
  titleSeparator: string;
  homepageTitle: string;
  homepageDescription: string;
  defaultOgImage: string;
  twitterHandle: string;
  facebookAppId: string;
  googleSiteVerification: string;
  bingSiteVerification: string;
  enableRichSnippets: boolean;
  enableOpenGraph: boolean;
  enableTwitterCards: boolean;
  robotsTxt: string;
  sitemapUrl: string;
  canonicalUrlFormat: string;
  enableAutoCanonical: boolean;
  enableBreadcrumbs: boolean;
  jsonLdType: string;
  organizationName: string;
  organizationLogo: string;
}

const initialSettings: SEOSettings = {
  siteName: 'My Review Site',
  siteDescription: 'The best place for authentic product and service reviews',
  siteKeywords: 'reviews, ratings, products, services, recommendations',
  defaultMetaTitle: 'Reviews & Ratings | My Review Site',
  defaultMetaDescription: 'Find honest reviews and ratings for products and services',
  titleSeparator: '|',
  homepageTitle: 'Home - My Review Site',
  homepageDescription: 'Discover trusted reviews and make informed decisions',
  defaultOgImage: '/images/og-default.jpg',
  twitterHandle: '@myreviewsite',
  facebookAppId: '',
  googleSiteVerification: '',
  bingSiteVerification: '',
  enableRichSnippets: true,
  enableOpenGraph: true,
  enableTwitterCards: true,
  robotsTxt: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://example.com/sitemap.xml`,
  sitemapUrl: 'https://example.com/sitemap.xml',
  canonicalUrlFormat: 'https://example.com',
  enableAutoCanonical: true,
  enableBreadcrumbs: true,
  jsonLdType: 'Organization',
  organizationName: 'My Review Site Inc.',
  organizationLogo: '/images/logo.png'
};

export default function SEOSettingsPage() {
  const [settings, setSettings] = useState<SEOSettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'technical' | 'structured'>('general');

  const handleFieldChange = (field: keyof SEOSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving SEO settings:', settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default settings?')) {
      setSettings(initialSettings);
      setHasChanges(false);
    }
  };

  const headerActions = [
    ...(hasChanges ? [
      { text: 'Reset', onClick: handleReset, variant: 'secondary' as const },
      { text: 'Save Changes', onClick: handleSave, variant: 'primary' as const }
    ] : [])
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminHeader
          title="SEO Settings"
          actions={headerActions}
        />

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-[#A96B11] text-[#A96B11]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'social'
                  ? 'border-[#A96B11] text-[#A96B11]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Social Media
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'technical'
                  ? 'border-[#A96B11] text-[#A96B11]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Technical
            </button>
            <button
              onClick={() => setActiveTab('structured')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'structured'
                  ? 'border-[#A96B11] text-[#A96B11]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Structured Data
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Site Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        id="siteName"
                        value={settings.siteName}
                        onChange={(e) => handleFieldChange('siteName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      />
                    </div>

                    <div>
                      <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-2">
                        Site Description
                      </label>
                      <textarea
                        id="siteDescription"
                        value={settings.siteDescription}
                        onChange={(e) => handleFieldChange('siteDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      />
                    </div>

                    <div>
                      <label htmlFor="siteKeywords" className="block text-sm font-medium text-gray-700 mb-2">
                        Default Keywords
                      </label>
                      <input
                        type="text"
                        id="siteKeywords"
                        value={settings.siteKeywords}
                        onChange={(e) => handleFieldChange('siteKeywords', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="Separate keywords with commas"
                      />
                    </div>

                    <div>
                      <label htmlFor="titleSeparator" className="block text-sm font-medium text-gray-700 mb-2">
                        Title Separator
                      </label>
                      <select
                        id="titleSeparator"
                        value={settings.titleSeparator}
                        onChange={(e) => handleFieldChange('titleSeparator', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      >
                        <option value="|">| (Pipe)</option>
                        <option value="-">- (Dash)</option>
                        <option value="•">• (Bullet)</option>
                        <option value="—">— (Em dash)</option>
                        <option value="·">· (Middle dot)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Default Meta Tags</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="defaultMetaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                        Default Meta Title
                      </label>
                      <input
                        type="text"
                        id="defaultMetaTitle"
                        value={settings.defaultMetaTitle}
                        onChange={(e) => handleFieldChange('defaultMetaTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        {settings.defaultMetaTitle.length}/60 characters
                      </p>
                    </div>

                    <div>
                      <label htmlFor="defaultMetaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                        Default Meta Description
                      </label>
                      <textarea
                        id="defaultMetaDescription"
                        value={settings.defaultMetaDescription}
                        onChange={(e) => handleFieldChange('defaultMetaDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        {settings.defaultMetaDescription.length}/160 characters
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Homepage SEO</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="homepageTitle" className="block text-sm font-medium text-gray-700 mb-2">
                        Homepage Title
                      </label>
                      <input
                        type="text"
                        id="homepageTitle"
                        value={settings.homepageTitle}
                        onChange={(e) => handleFieldChange('homepageTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      />
                    </div>

                    <div>
                      <label htmlFor="homepageDescription" className="block text-sm font-medium text-gray-700 mb-2">
                        Homepage Description
                      </label>
                      <textarea
                        id="homepageDescription"
                        value={settings.homepageDescription}
                        onChange={(e) => handleFieldChange('homepageDescription', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Social Media Tab */}
            {activeTab === 'social' && (
              <>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Open Graph</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableOpenGraph"
                        checked={settings.enableOpenGraph}
                        onChange={(e) => handleFieldChange('enableOpenGraph', e.target.checked)}
                        className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                      />
                      <label htmlFor="enableOpenGraph" className="ml-2 text-sm text-gray-700">
                        Enable Open Graph tags
                      </label>
                    </div>

                    <div>
                      <label htmlFor="defaultOgImage" className="block text-sm font-medium text-gray-700 mb-2">
                        Default OG Image URL
                      </label>
                      <input
                        type="text"
                        id="defaultOgImage"
                        value={settings.defaultOgImage}
                        onChange={(e) => handleFieldChange('defaultOgImage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="/images/og-default.jpg"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Recommended: 1200x630px, under 1MB
                      </p>
                    </div>

                    <div>
                      <label htmlFor="facebookAppId" className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook App ID
                      </label>
                      <input
                        type="text"
                        id="facebookAppId"
                        value={settings.facebookAppId}
                        onChange={(e) => handleFieldChange('facebookAppId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="Your Facebook App ID"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Twitter Cards</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableTwitterCards"
                        checked={settings.enableTwitterCards}
                        onChange={(e) => handleFieldChange('enableTwitterCards', e.target.checked)}
                        className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                      />
                      <label htmlFor="enableTwitterCards" className="ml-2 text-sm text-gray-700">
                        Enable Twitter Cards
                      </label>
                    </div>

                    <div>
                      <label htmlFor="twitterHandle" className="block text-sm font-medium text-gray-700 mb-2">
                        Twitter Handle
                      </label>
                      <input
                        type="text"
                        id="twitterHandle"
                        value={settings.twitterHandle}
                        onChange={(e) => handleFieldChange('twitterHandle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="@yourhandle"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Technical Tab */}
            {activeTab === 'technical' && (
              <>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Site Verification</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="googleSiteVerification" className="block text-sm font-medium text-gray-700 mb-2">
                        Google Site Verification
                      </label>
                      <input
                        type="text"
                        id="googleSiteVerification"
                        value={settings.googleSiteVerification}
                        onChange={(e) => handleFieldChange('googleSiteVerification', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="Verification code from Google Search Console"
                      />
                    </div>

                    <div>
                      <label htmlFor="bingSiteVerification" className="block text-sm font-medium text-gray-700 mb-2">
                        Bing Site Verification
                      </label>
                      <input
                        type="text"
                        id="bingSiteVerification"
                        value={settings.bingSiteVerification}
                        onChange={(e) => handleFieldChange('bingSiteVerification', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="Verification code from Bing Webmaster Tools"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Sitemap & Robots</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="sitemapUrl" className="block text-sm font-medium text-gray-700 mb-2">
                        Sitemap URL
                      </label>
                      <input
                        type="text"
                        id="sitemapUrl"
                        value={settings.sitemapUrl}
                        onChange={(e) => handleFieldChange('sitemapUrl', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="https://example.com/sitemap.xml"
                      />
                    </div>

                    <div>
                      <label htmlFor="robotsTxt" className="block text-sm font-medium text-gray-700 mb-2">
                        Robots.txt Content
                      </label>
                      <textarea
                        id="robotsTxt"
                        value={settings.robotsTxt}
                        onChange={(e) => handleFieldChange('robotsTxt', e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11] font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Canonical URLs</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableAutoCanonical"
                        checked={settings.enableAutoCanonical}
                        onChange={(e) => handleFieldChange('enableAutoCanonical', e.target.checked)}
                        className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                      />
                      <label htmlFor="enableAutoCanonical" className="ml-2 text-sm text-gray-700">
                        Automatically generate canonical URLs
                      </label>
                    </div>

                    <div>
                      <label htmlFor="canonicalUrlFormat" className="block text-sm font-medium text-gray-700 mb-2">
                        Canonical URL Base
                      </label>
                      <input
                        type="text"
                        id="canonicalUrlFormat"
                        value={settings.canonicalUrlFormat}
                        onChange={(e) => handleFieldChange('canonicalUrlFormat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Structured Data Tab */}
            {activeTab === 'structured' && (
              <>
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Rich Snippets</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableRichSnippets"
                        checked={settings.enableRichSnippets}
                        onChange={(e) => handleFieldChange('enableRichSnippets', e.target.checked)}
                        className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                      />
                      <label htmlFor="enableRichSnippets" className="ml-2 text-sm text-gray-700">
                        Enable Rich Snippets
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableBreadcrumbs"
                        checked={settings.enableBreadcrumbs}
                        onChange={(e) => handleFieldChange('enableBreadcrumbs', e.target.checked)}
                        className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                      />
                      <label htmlFor="enableBreadcrumbs" className="ml-2 text-sm text-gray-700">
                        Enable Breadcrumb Schema
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Schema</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="jsonLdType" className="block text-sm font-medium text-gray-700 mb-2">
                        Schema Type
                      </label>
                      <select
                        id="jsonLdType"
                        value={settings.jsonLdType}
                        onChange={(e) => handleFieldChange('jsonLdType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      >
                        <option value="Organization">Organization</option>
                        <option value="LocalBusiness">Local Business</option>
                        <option value="Corporation">Corporation</option>
                        <option value="EducationalOrganization">Educational Organization</option>
                        <option value="GovernmentOrganization">Government Organization</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        id="organizationName"
                        value={settings.organizationName}
                        onChange={(e) => handleFieldChange('organizationName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      />
                    </div>

                    <div>
                      <label htmlFor="organizationLogo" className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Logo URL
                      </label>
                      <input
                        type="text"
                        id="organizationLogo"
                        value={settings.organizationLogo}
                        onChange={(e) => handleFieldChange('organizationLogo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="/images/logo.png"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Should be at least 112x112px, preferably square
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Preview</h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {settings.defaultMetaTitle || 'Page Title'}
                  </div>
                  <div className="text-green-700 text-sm mt-1">
                    {settings.canonicalUrlFormat}/sample-page
                  </div>
                  <div className="text-gray-600 text-sm mt-2">
                    {settings.defaultMetaDescription || 'Page description will appear here...'}
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  This is how your page might appear in search results
                </p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Generate Sitemap
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Test Rich Snippets
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Validate Schema Markup
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Check Mobile Usability
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Analyze Page Speed
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Keep titles under 60 characters</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Meta descriptions: 150-160 characters</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Use structured data for rich results</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Optimize images with alt text</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Submit sitemap to search engines</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}