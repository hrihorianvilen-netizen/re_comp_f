import Image from 'next/image';
import Link from 'next/link';
import { Advertisement as AdType } from '@/types/api';

interface AdvertisementProps {
  advertisement: AdType;
  className?: string;
}

export default function Advertisement({ advertisement, className = '' }: AdvertisementProps) {
  return (
    <div className={`bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-medium">
              Sponsored
            </span>
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-900">
            {advertisement.title}
          </h3>
          {advertisement.description && (
            <p className="text-gray-700 mb-4">
              {advertisement.description}
            </p>
          )}
          {advertisement.link && (
            <Link
              href={advertisement.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium"
            >
              Learn More
            </Link>
          )}
        </div>
        {advertisement.imageUrl && (
          <div className="ml-6">
            <Image
              src={advertisement.imageUrl}
              alt={advertisement.title}
              width={120}
              height={80}
              className="rounded-lg object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}