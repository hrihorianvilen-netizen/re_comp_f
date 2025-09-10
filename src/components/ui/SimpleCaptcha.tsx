'use client';

import { useState, useEffect } from 'react';

interface SimpleCaptchaProps {
  onVerify: (isVerified: boolean) => void;
  reset?: boolean;
}

export default function SimpleCaptcha({ onVerify, reset }: SimpleCaptchaProps) {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');

  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    setCaptchaText(generateCaptcha());
  }, []);

  useEffect(() => {
    if (reset) {
      setCaptchaText(generateCaptcha());
      setUserInput('');
      setIsVerified(false);
      setError('');
      onVerify(false);
    }
  }, [reset]);

  const handleInputChange = (value: string) => {
    setUserInput(value);
    setError('');
    
    if (value.toUpperCase() === captchaText) {
      setIsVerified(true);
      onVerify(true);
    } else {
      setIsVerified(false);
      onVerify(false);
    }
  };

  const refreshCaptcha = () => {
    setCaptchaText(generateCaptcha());
    setUserInput('');
    setIsVerified(false);
    setError('');
    onVerify(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Security Verification *
      </label>
      
      {/* Captcha Display */}
      <div className="flex items-center gap-3">
        <div className="bg-gray-100 px-4 py-3 rounded border-2 border-dashed border-gray-300 font-mono text-lg tracking-widest select-none">
          {captchaText}
        </div>
        <button
          type="button"
          onClick={refreshCaptcha}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="Refresh captcha"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Input Field */}
      <div>
        <input
          type="text"
          value={userInput}
          onChange={(e) => handleInputChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
            isVerified 
              ? 'border-green-300 focus:ring-green-500 bg-green-50' 
              : error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-[#198639]'
          }`}
          placeholder="Enter the code above"
          maxLength={6}
        />
        {isVerified && (
          <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Verification successful
          </p>
        )}
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
      
      <p className="text-xs text-gray-500">
        Please enter the characters shown above to verify you&apos;re human.
      </p>
    </div>
  );
}