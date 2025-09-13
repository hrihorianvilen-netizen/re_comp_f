'use client';

import { useDisplayAds, useTrackClick } from '@/hooks/useAds';
import Advertisement from './Advertisement';

interface AdSlotProps {
  slot: 'top' | 'sidebar' | 'footer' | 'inline';
  merchantId?: string;
  className?: string;
}

export default function AdSlot({ slot, merchantId, className = '' }: AdSlotProps) {
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

  // Get slot-specific styling
  const getSlotStyles = () => {
    switch (slot) {
      case 'top':
        return 'w-full max-w-7xl mx-auto px-4 py-4';
      case 'sidebar':
        return 'w-full';
      case 'footer':
        return 'w-full max-w-7xl mx-auto px-4 py-6';
      case 'inline':
        return 'w-full my-6';
      default:
        return '';
    }
  };

  return (
    <div className={`ad-slot ad-slot-${slot} ${getSlotStyles()} ${className}`}>
      {data.ads.map((ad) => (
        <div
          key={ad.id}
          onClick={() => handleAdClick(ad.id, ad.link)}
          className="cursor-pointer"
        >
          <Advertisement advertisement={ad} />
        </div>
      ))}
    </div>
  );
}