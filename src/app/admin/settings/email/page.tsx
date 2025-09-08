'use client';

import { useState } from 'react';
import AdminHeader from '@/components/admin/shared/AdminHeader';

interface EmailSettings {
  // Email Configuration
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpEncryption: 'none' | 'tls' | 'ssl';
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  
  // Email Templates
  welcomeEmailEnabled: boolean;
  welcomeEmailSubject: string;
  welcomeEmailContent: string;
  resetPasswordSubject: string;
  resetPasswordContent: string;
  verificationEmailSubject: string;
  verificationEmailContent: string;
  
  // Authentication
  enableFacebookAuth: boolean;
  facebookAppId: string;
  facebookAppSecret: string;
  enableGoogleAuth: boolean;
  googleClientId: string;
  googleClientSecret: string;
  enableAppleAuth: boolean;
  appleTeamId: string;
  appleServiceId: string;
  appleKeyId: string;
  applePrivateKey: string;
}

const initialSettings: EmailSettings = {
  // Email Configuration
  smtpHost: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  smtpEncryption: 'tls',
  fromName: 'My Review Site',
  fromEmail: 'noreply@example.com',
  replyToEmail: 'support@example.com',
  
  // Email Templates
  welcomeEmailEnabled: true,
  welcomeEmailSubject: 'Welcome to My Review Site!',
  welcomeEmailContent: `Welcome to My Review Site!

Thank you for creating your account. We're excited to have you join our community.

You can now:
- Write and share reviews
- Follow other reviewers
- Save your favorite products

Get started by exploring our latest reviews and sharing your own experiences.

Best regards,
The My Review Site Team`,
  
  resetPasswordSubject: 'Reset Your Password',
  resetPasswordContent: `Password Reset Request

You have requested to reset your password for your My Review Site account.

Click the link below to reset your password:
{reset_link}

If you didn't request this, please ignore this email.

Best regards,
The My Review Site Team`,

  verificationEmailSubject: 'Verify Your Email Address',
  verificationEmailContent: `Email Verification Required

Please verify your email address to activate your My Review Site account.

Click the link below to verify your email:
{verification_link}

If you didn't create this account, please ignore this email.

Best regards,
The My Review Site Team`,

  // Authentication
  enableFacebookAuth: false,
  facebookAppId: '',
  facebookAppSecret: '',
  enableGoogleAuth: false,
  googleClientId: '',
  googleClientSecret: '',
  enableAppleAuth: false,
  appleTeamId: '',
  appleServiceId: '',
  appleKeyId: '',
  applePrivateKey: ''
};

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleFieldChange = (field: keyof EmailSettings, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving email settings:', settings);
    setHasChanges(false);
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard all changes?')) {
      setSettings(initialSettings);
      setHasChanges(false);
    }
  };

  const headerActions = [
    ...(hasChanges ? [
      { text: 'Discard', onClick: handleDiscard, variant: 'secondary' as const },
      { text: 'Save Changes', onClick: handleSave, variant: 'primary' as const }
    ] : [])
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminHeader
          title="Email & Authentication"
          actions={headerActions}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email Configuration */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Email Configuration</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      id="smtpHost"
                      value={settings.smtpHost}
                      onChange={(e) => handleFieldChange('smtpHost', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      id="smtpPort"
                      value={settings.smtpPort}
                      onChange={(e) => handleFieldChange('smtpPort', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="587"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    id="smtpUsername"
                    value={settings.smtpUsername}
                    onChange={(e) => handleFieldChange('smtpUsername', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div>
                  <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    id="smtpPassword"
                    value={settings.smtpPassword}
                    onChange={(e) => handleFieldChange('smtpPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="Your SMTP password or app password"
                  />
                </div>

                <div>
                  <label htmlFor="smtpEncryption" className="block text-sm font-medium text-gray-700 mb-2">
                    Encryption
                  </label>
                  <select
                    id="smtpEncryption"
                    value={settings.smtpEncryption}
                    onChange={(e) => handleFieldChange('smtpEncryption', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                  >
                    <option value="none">None</option>
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fromName" className="block text-sm font-medium text-gray-700 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      id="fromName"
                      value={settings.fromName}
                      onChange={(e) => handleFieldChange('fromName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="My Review Site"
                    />
                  </div>

                  <div>
                    <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      id="fromEmail"
                      value={settings.fromEmail}
                      onChange={(e) => handleFieldChange('fromEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      placeholder="noreply@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="replyToEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Reply To Email
                  </label>
                  <input
                    type="email"
                    id="replyToEmail"
                    value={settings.replyToEmail}
                    onChange={(e) => handleFieldChange('replyToEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    placeholder="support@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Email Templates */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Email Templates</h3>
              <div className="space-y-6">
                {/* Welcome Email */}
                <div>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="welcomeEmailEnabled"
                      checked={settings.welcomeEmailEnabled}
                      onChange={(e) => handleFieldChange('welcomeEmailEnabled', e.target.checked)}
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                    <label htmlFor="welcomeEmailEnabled" className="ml-2 text-sm font-medium text-gray-700">
                      Enable Welcome Email
                    </label>
                  </div>

                  {settings.welcomeEmailEnabled && (
                    <>
                      <div className="mb-4">
                        <label htmlFor="welcomeEmailSubject" className="block text-sm font-medium text-gray-700 mb-2">
                          Welcome Email Subject
                        </label>
                        <input
                          type="text"
                          id="welcomeEmailSubject"
                          value={settings.welcomeEmailSubject}
                          onChange={(e) => handleFieldChange('welcomeEmailSubject', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        />
                      </div>

                      <div>
                        <label htmlFor="welcomeEmailContent" className="block text-sm font-medium text-gray-700 mb-2">
                          Welcome Email Content
                        </label>
                        <textarea
                          id="welcomeEmailContent"
                          value={settings.welcomeEmailContent}
                          onChange={(e) => handleFieldChange('welcomeEmailContent', e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Password Reset Email */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Password Reset Email</h4>
                  
                  <div className="mb-4">
                    <label htmlFor="resetPasswordSubject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="resetPasswordSubject"
                      value={settings.resetPasswordSubject}
                      onChange={(e) => handleFieldChange('resetPasswordSubject', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    />
                  </div>

                  <div>
                    <label htmlFor="resetPasswordContent" className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      id="resetPasswordContent"
                      value={settings.resetPasswordContent}
                      onChange={(e) => handleFieldChange('resetPasswordContent', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    />
                    <p className="mt-1 text-sm text-gray-500">Use {'{reset_link}'} for the password reset link</p>
                  </div>
                </div>

                {/* Email Verification */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Email Verification</h4>
                  
                  <div className="mb-4">
                    <label htmlFor="verificationEmailSubject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="verificationEmailSubject"
                      value={settings.verificationEmailSubject}
                      onChange={(e) => handleFieldChange('verificationEmailSubject', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    />
                  </div>

                  <div>
                    <label htmlFor="verificationEmailContent" className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      id="verificationEmailContent"
                      value={settings.verificationEmailContent}
                      onChange={(e) => handleFieldChange('verificationEmailContent', e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                    />
                    <p className="mt-1 text-sm text-gray-500">Use {'{verification_link}'} for the email verification link</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Authentication */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Authentication</h3>
              <div className="space-y-6">
                {/* Facebook Authentication */}
                <div>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="enableFacebookAuth"
                      checked={settings.enableFacebookAuth}
                      onChange={(e) => handleFieldChange('enableFacebookAuth', e.target.checked)}
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                    <label htmlFor="enableFacebookAuth" className="ml-2 text-sm font-medium text-gray-700">
                      Enable Facebook Authentication
                    </label>
                  </div>

                  {settings.enableFacebookAuth && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                      <div>
                        <label htmlFor="facebookAppSecret" className="block text-sm font-medium text-gray-700 mb-2">
                          Facebook App Secret
                        </label>
                        <input
                          type="password"
                          id="facebookAppSecret"
                          value={settings.facebookAppSecret}
                          onChange={(e) => handleFieldChange('facebookAppSecret', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                          placeholder="Your Facebook App Secret"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Google Authentication */}
                <div>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="enableGoogleAuth"
                      checked={settings.enableGoogleAuth}
                      onChange={(e) => handleFieldChange('enableGoogleAuth', e.target.checked)}
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                    <label htmlFor="enableGoogleAuth" className="ml-2 text-sm font-medium text-gray-700">
                      Enable Google Authentication
                    </label>
                  </div>

                  {settings.enableGoogleAuth && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="googleClientId" className="block text-sm font-medium text-gray-700 mb-2">
                          Google Client ID
                        </label>
                        <input
                          type="text"
                          id="googleClientId"
                          value={settings.googleClientId}
                          onChange={(e) => handleFieldChange('googleClientId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                          placeholder="Your Google Client ID"
                        />
                      </div>

                      <div>
                        <label htmlFor="googleClientSecret" className="block text-sm font-medium text-gray-700 mb-2">
                          Google Client Secret
                        </label>
                        <input
                          type="password"
                          id="googleClientSecret"
                          value={settings.googleClientSecret}
                          onChange={(e) => handleFieldChange('googleClientSecret', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                          placeholder="Your Google Client Secret"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Apple Authentication */}
                <div>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="enableAppleAuth"
                      checked={settings.enableAppleAuth}
                      onChange={(e) => handleFieldChange('enableAppleAuth', e.target.checked)}
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                    <label htmlFor="enableAppleAuth" className="ml-2 text-sm font-medium text-gray-700">
                      Enable Apple Authentication
                    </label>
                  </div>

                  {settings.enableAppleAuth && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="appleTeamId" className="block text-sm font-medium text-gray-700 mb-2">
                            Apple Team ID
                          </label>
                          <input
                            type="text"
                            id="appleTeamId"
                            value={settings.appleTeamId}
                            onChange={(e) => handleFieldChange('appleTeamId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                            placeholder="Your Apple Team ID"
                          />
                        </div>

                        <div>
                          <label htmlFor="appleServiceId" className="block text-sm font-medium text-gray-700 mb-2">
                            Apple Service ID
                          </label>
                          <input
                            type="text"
                            id="appleServiceId"
                            value={settings.appleServiceId}
                            onChange={(e) => handleFieldChange('appleServiceId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                            placeholder="Your Apple Service ID"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="appleKeyId" className="block text-sm font-medium text-gray-700 mb-2">
                          Apple Key ID
                        </label>
                        <input
                          type="text"
                          id="appleKeyId"
                          value={settings.appleKeyId}
                          onChange={(e) => handleFieldChange('appleKeyId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                          placeholder="Your Apple Key ID"
                        />
                      </div>

                      <div>
                        <label htmlFor="applePrivateKey" className="block text-sm font-medium text-gray-700 mb-2">
                          Apple Private Key
                        </label>
                        <textarea
                          id="applePrivateKey"
                          value={settings.applePrivateKey}
                          onChange={(e) => handleFieldChange('applePrivateKey', e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                          placeholder="-----BEGIN PRIVATE KEY-----&#10;Your Apple Private Key Content&#10;-----END PRIVATE KEY-----"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Email Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">SMTP Configured</span>
                  <span className={`text-sm ${settings.smtpHost && settings.smtpUsername ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.smtpHost && settings.smtpUsername ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Welcome Email</span>
                  <span className={`text-sm ${settings.welcomeEmailEnabled ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.welcomeEmailEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Facebook Auth</span>
                  <span className={`text-sm ${settings.enableFacebookAuth ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.enableFacebookAuth ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Google Auth</span>
                  <span className={`text-sm ${settings.enableGoogleAuth ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.enableGoogleAuth ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Apple Auth</span>
                  <span className={`text-sm ${settings.enableAppleAuth ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.enableAppleAuth ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Test Email Configuration
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Send Test Email
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Preview Email Templates
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Test OAuth Providers
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Use app passwords for Gmail SMTP</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Test OAuth apps in development mode first</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Keep email templates user-friendly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}