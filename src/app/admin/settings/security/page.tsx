'use client';

import { useState } from 'react';
import AdminHeader from '@/components/admin/shared/AdminHeader';

interface SecuritySettings {
  enableRecaptchaV2: boolean;
  recaptchaV2SiteKey: string;
  recaptchaV2SecretKey: string;
  enableRecaptchaV3: boolean;
  recaptchaV3SiteKey: string;
  recaptchaV3SecretKey: string;
  recaptchaV3ScoreThreshold: number;
  enableAutoSpamDetection: boolean;
  autoSpamThreshold: number;
}

const initialSettings: SecuritySettings = {
  enableRecaptchaV2: false,
  recaptchaV2SiteKey: '',
  recaptchaV2SecretKey: '',
  enableRecaptchaV3: false,
  recaptchaV3SiteKey: '',
  recaptchaV3SecretKey: '',
  recaptchaV3ScoreThreshold: 0.5,
  enableAutoSpamDetection: true,
  autoSpamThreshold: 75
};

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleFieldChange = (field: keyof SecuritySettings, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving spam control settings:', settings);
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
          title="Spam Control"
          actions={headerActions}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* reCAPTCHA v2 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">reCAPTCHA v2</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableRecaptchaV2"
                    checked={settings.enableRecaptchaV2}
                    onChange={(e) => handleFieldChange('enableRecaptchaV2', e.target.checked)}
                    className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                  />
                  <label htmlFor="enableRecaptchaV2" className="ml-2 text-sm text-gray-700">
                    Enable reCAPTCHA v2
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  {`Classic "I'm not a robot" checkbox verification`}
                </p>

                {settings.enableRecaptchaV2 && (
                  <>
                    <div>
                      <label htmlFor="recaptchaV2SiteKey" className="block text-sm font-medium text-gray-700 mb-2">
                        reCAPTCHA v2 Site Key
                      </label>
                      <input
                        type="text"
                        id="recaptchaV2SiteKey"
                        value={settings.recaptchaV2SiteKey}
                        onChange={(e) => handleFieldChange('recaptchaV2SiteKey', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                      />
                    </div>

                    <div>
                      <label htmlFor="recaptchaV2SecretKey" className="block text-sm font-medium text-gray-700 mb-2">
                        reCAPTCHA v2 Secret Key
                      </label>
                      <input
                        type="password"
                        id="recaptchaV2SecretKey"
                        value={settings.recaptchaV2SecretKey}
                        onChange={(e) => handleFieldChange('recaptchaV2SecretKey', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* reCAPTCHA v3 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">reCAPTCHA v3</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableRecaptchaV3"
                    checked={settings.enableRecaptchaV3}
                    onChange={(e) => handleFieldChange('enableRecaptchaV3', e.target.checked)}
                    className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                  />
                  <label htmlFor="enableRecaptchaV3" className="ml-2 text-sm text-gray-700">
                    Enable reCAPTCHA v3
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Invisible protection that uses behavioral analysis to detect bots
                </p>

                {settings.enableRecaptchaV3 && (
                  <>
                    <div>
                      <label htmlFor="recaptchaV3SiteKey" className="block text-sm font-medium text-gray-700 mb-2">
                        reCAPTCHA v3 Site Key
                      </label>
                      <input
                        type="text"
                        id="recaptchaV3SiteKey"
                        value={settings.recaptchaV3SiteKey}
                        onChange={(e) => handleFieldChange('recaptchaV3SiteKey', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                      />
                    </div>

                    <div>
                      <label htmlFor="recaptchaV3SecretKey" className="block text-sm font-medium text-gray-700 mb-2">
                        reCAPTCHA v3 Secret Key
                      </label>
                      <input
                        type="password"
                        id="recaptchaV3SecretKey"
                        value={settings.recaptchaV3SecretKey}
                        onChange={(e) => handleFieldChange('recaptchaV3SecretKey', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                        placeholder="6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
                      />
                    </div>

                    <div>
                      <label htmlFor="recaptchaV3ScoreThreshold" className="block text-sm font-medium text-gray-700 mb-2">
                        Score Threshold (0.0 - 1.0)
                      </label>
                      <input
                        type="number"
                        id="recaptchaV3ScoreThreshold"
                        value={settings.recaptchaV3ScoreThreshold}
                        onChange={(e) => handleFieldChange('recaptchaV3ScoreThreshold', parseFloat(e.target.value))}
                        min="0"
                        max="1"
                        step="0.1"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Lower scores indicate potential bots. Recommended: 0.5
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Auto Spam Detection */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Auto Spam Detection</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableAutoSpamDetection"
                    checked={settings.enableAutoSpamDetection}
                    onChange={(e) => handleFieldChange('enableAutoSpamDetection', e.target.checked)}
                    className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                  />
                  <label htmlFor="enableAutoSpamDetection" className="ml-2 text-sm text-gray-700">
                    Enable automatic spam detection
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Automatically detect and filter spam content based on predefined rules
                </p>

                <div>
                  <label htmlFor="autoSpamThreshold" className="block text-sm font-medium text-gray-700 mb-2">
                    Spam Threshold (0-100)
                  </label>
                  <input
                    type="number"
                    id="autoSpamThreshold"
                    value={settings.autoSpamThreshold}
                    onChange={(e) => handleFieldChange('autoSpamThreshold', parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Content scoring above this threshold will be flagged as spam
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Spam Protection Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">reCAPTCHA v2</span>
                  <span className={`text-sm ${settings.enableRecaptchaV2 ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.enableRecaptchaV2 ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">reCAPTCHA v3</span>
                  <span className={`text-sm ${settings.enableRecaptchaV3 ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.enableRecaptchaV3 ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Auto Detection</span>
                  <span className={`text-sm ${settings.enableAutoSpamDetection ? 'text-green-600' : 'text-red-600'}`}>
                    {settings.enableAutoSpamDetection ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                {settings.enableRecaptchaV3 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">v3 Threshold</span>
                    <span className="text-sm text-gray-600">{settings.recaptchaV3ScoreThreshold}</span>
                  </div>
                )}
                {settings.enableAutoSpamDetection && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Spam Threshold</span>
                    <span className="text-sm text-gray-600">{settings.autoSpamThreshold}%</span>
                  </div>
                )}
              </div>
            </div>


            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tips</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Use v3 for seamless user experience</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Lower threshold = stricter filtering</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Monitor spam rules effectiveness</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}