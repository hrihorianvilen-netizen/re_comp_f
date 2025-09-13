'use client';

import { useDisplayAds, useTrackClick } from '@/hooks/useAds';
import Advertisement from './Advertisement';

interface AdSlotProps {
  slot: 'top' | 'sidebar' | 'footer' | 'inline';
  merchantId?: string;
  className?: string;
  maxAds?: number;
}

export default function AdSlot({ slot, merchantId, className = '', maxAds }: AdSlotProps) {
  const { data, isLoading } = useDisplayAds(slot, merchantId);
  const trackClick = useTrackClick();

  // Don't render anything if loading or no ads
  if (isLoading || !data?.ads || data.ads.length === 0) {
    return null;
  }

  const handleAdClick = async (adId: string, link?: string) => {
    // Track the click
    try {
      await trackClick.mutateAsync(adId);
    } catch (error) {
      console.error('Failed to track ad click:', error);
    }

    // Open the link if provided
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  // Get slot-specific grid configuration
  const getSlotConfig = () => {
    switch (slot) {
      case 'top':
        return {
          containerClass: 'w-full max-w-7xl mx-auto px-4 py-4',
          gridClass: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
          maxAds: maxAds || 4,
        };
      case 'sidebar':
        return {
          containerClass: 'w-full',
          gridClass: 'flex flex-col gap-4 lg:gap-4',
          maxAds: maxAds || 3,
        };
      case 'footer':
        return {
          containerClass: 'w-full bg-gray-50 py-8',
          gridClass: 'max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
          maxAds: maxAds || 4,
        };
      case 'inline':
        return {
          containerClass: 'w-full my-8',
          gridClass: 'max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
          maxAds: maxAds || 4,
        };
      default:
        return {
          containerClass: '',
          gridClass: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
          maxAds: maxAds || 4,
        };
    }
  };

  const config = getSlotConfig();
  const adsToDisplay = data.ads.slice(0, config.maxAds);

  return (
    <div className={`ad-slot ad-slot-${slot} ${config.containerClass} ${className}`}>
      {slot === 'footer' && (
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Sponsored Content</h3>
        </div>
      )}
      <div className={config.gridClass}>
        {adsToDisplay.map((ad) => (
          <div
            key={ad.id}
            onClick={() => handleAdClick(ad.id, ad.link)}
            className="cursor-pointer transform transition-all duration-200 hover:scale-[1.02]"
          >
            <Advertisement
              advertisement={ad}
              variant={slot}
            />
          </div>
        ))}
      </div>
    </div>
  );
}