import Link from 'next/link';
import { Merchant } from '@/types/api';
import { RatingStars } from '@/components/ui';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { getImageUrl } from '@/lib/utils';

interface MerchantCardProps {
  merchant: Merchant;
}

const statusColors = {
  recommended: 'bg-green-100 text-green-800',
  trusted: 'bg-blue-100 text-blue-800',
  controversial: 'bg-yellow-100 text-yellow-800',
  avoid: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-800',
  pending: 'bg-orange-100 text-orange-800',
  approved: 'bg-green-100 text-green-800',
  suspended: 'bg-red-100 text-red-800',
  rejected: 'bg-gray-100 text-gray-800',
  draft: 'bg-purple-100 text-purple-800',
} as const;

const statusLabels = {
  recommended: 'Recommended',
  trusted: 'Trusted',
  controversial: 'Controversial',
  avoid: 'Avoid',
  neutral: 'Neutral',
  pending: 'Pending',
  approved: 'Approved',
  suspended: 'Suspended',
  rejected: 'Rejected',
  draft: 'Draft',
} as const;

export default function MerchantCard({ merchant }: MerchantCardProps) {

  return (
    <Link href={`/merchants/${merchant.slug || merchant.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
        <div className="flex items-center justify-between mb-4">
          {merchant.logo ? (
            <OptimizedImage
              src={getImageUrl(merchant.logo)}
              alt={merchant.name}
              width={40}
              height={40}
              className="rounded-lg"
              sizes="40px"
              quality={85}
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500 font-semibold">
                {merchant.name.charAt(0)}
              </span>
            </div>
          )}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[merchant.status]}`}>
            {statusLabels[merchant.status]}
          </span>
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{merchant.name}</h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {merchant.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <RatingStars rating={merchant.rating} size={16} />
            <span className="text-sm text-gray-600 ml-1">
              {merchant.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {merchant.reviewCount} reviews
          </span>
        </div>

        <div className="mt-3 pt-3 border-t">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {merchant.category}
          </span>
        </div>
      </div>
    </Link>
  );
}