'use client';

interface AdvertisementSlotBadgeProps {
  slot: string;
}

export default function AdvertisementSlotBadge({ slot }: AdvertisementSlotBadgeProps) {
  const getBadgeClasses = () => {
    const colorMap: Record<string, string> = {
      'header': 'bg-purple-100 text-purple-800',
      'sidebar': 'bg-yellow-100 text-yellow-800',
      'footer': 'bg-indigo-100 text-indigo-800',
      'content': 'bg-pink-100 text-pink-800',
      'popup': 'bg-orange-100 text-orange-800'
    };
    
    return colorMap[slot] || 'bg-gray-100 text-gray-800';
  };

  const getSlotLabel = () => {
    return slot.charAt(0).toUpperCase() + slot.slice(1);
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeClasses()}`}>
      {getSlotLabel()}
    </span>
  );
}