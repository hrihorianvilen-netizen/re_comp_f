'use client';

import Link from 'next/link';

interface AdvertisementHeaderProps {
  title: string;
  addButtonText: string;
  addButtonHref: string;
}

export default function AdvertisementHeader({ 
  title, 
  addButtonText, 
  addButtonHref 
}: AdvertisementHeaderProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
      <Link
        href={addButtonHref}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A96B11] hover:bg-[#8b5a0e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11] transition-colors"
      >
        {addButtonText}
      </Link>
    </div>
  );
}