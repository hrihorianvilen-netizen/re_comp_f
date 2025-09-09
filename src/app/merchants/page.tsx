import { Suspense } from 'react';
import MerchantsContent from './MerchantsContent';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#198639]"></div>
    </div>
  );
}

export default function MerchantsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MerchantsContent />
    </Suspense>
  );
}