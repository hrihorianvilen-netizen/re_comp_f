'use client';

import React from 'react';

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
}

export default function LoadingOverlay({ show, message = 'Processing...' }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A96B11]"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-r-2 border-[#A96B11] opacity-50 animation-delay-150"></div>
          </div>
          <p className="text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}