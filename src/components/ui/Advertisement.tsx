import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';
import { Advertisement as AdType } from '@/types/api';

interface AdvertisementProps {
  advertisement: AdType;
  className?: string;
  variant?: 'top' | 'sidebar' | 'footer' | 'inline';
}

export default function Advertisement({ advertisement, className = '', variant = 'inline' }: AdvertisementProps) {
  // Different card styles based on slot variant
  const getCardStyle = () => {
    switch (variant) {
      case 'top':
        return 'bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md p-6';
      case 'sidebar':
        return 'bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md p-4';
      case 'footer':
        return 'bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md p-4 h-full';
      case 'inline':
      default:
        return 'bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md p-5 h-full';
    }
  };

  const isCompactView = variant === 'sidebar' || variant === 'footer';
  const isHorizontalView = variant === 'top';

  return (
    <div className={`ad-card transition-all duration-200 ${getCardStyle()} ${className}`}>
      {/* Sponsored Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium uppercase tracking-wider">
          Sponsored
        </span>
        {advertisement.merchant && (
          <span className="text-xs text-gray-500">
            by {advertisement.merchant.name}
          </span>
        )}
      </div>

      {/* Content Layout */}
      <div className={isHorizontalView ? 'flex items-start gap-4' : ''}>
        {/* Image Section */}
        {advertisement.imageUrl && (
          <div className={isHorizontalView ? 'flex-shrink-0' : 'mb-4'}>
            <div className={`relative overflow-hidden rounded-lg ${
              isHorizontalView ? 'w-32 h-24' :
              isCompactView ? 'w-full h-32' : 'w-full h-48'
            }`}>
              <OptimizedImage
                src={advertisement.imageUrl}
                alt={advertisement.title}
                fill
                className="object-cover"
                sizes={isHorizontalView ? '128px' : '(max-width: 768px) 100vw, 33vw'}
                sizeType="full"
                qualityPriority="low"
              />
            </div>
          </div>
        )}

        {/* Text Content */}
        <div className="flex-1">
          <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${
            isCompactView ? 'text-base' : 'text-lg'
          }`}>
            {advertisement.title}
          </h3>

          {advertisement.description && !isCompactView && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {advertisement.description}
            </p>
          )}

          {advertisement.description && isCompactView && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {advertisement.description}
            </p>
          )}

          {/* CTA Button */}
          {advertisement.link && (
            <div className={isHorizontalView ? '' : 'mt-auto'}>
              <Link
                href={advertisement.link}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex items-center justify-center font-medium transition-colors ${
                  isCompactView
                    ? 'text-sm bg-[#198639] text-white px-3 py-1.5 rounded hover:bg-[#15732f] w-full'
                    : 'text-sm bg-[#198639] text-white px-4 py-2 rounded-md hover:bg-[#15732f]'
                }`}
              >
                Learn More
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}