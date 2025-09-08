'use client';

interface AdvertisementStatusBadgeProps {
  status: string;
}

export default function AdvertisementStatusBadge({ status }: AdvertisementStatusBadgeProps) {
  const getBadgeClasses = () => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-blue-100 text-blue-800';
      case 'trash':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeClasses()}`}>
      {getStatusLabel()}
    </span>
  );
}