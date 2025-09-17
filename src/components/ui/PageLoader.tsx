'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function PageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    // Start loading immediately
    handleStart();

    // Stop loading after navigation completes
    const timer = setTimeout(() => {
      handleComplete();
    }, 500);

    return () => {
      clearTimeout(timer);
      handleComplete();
    };
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-white">
      <div className="h-1 bg-gray-200">
        <div className="h-full bg-[#A96B11] animate-[loading_1s_ease-in-out_infinite]" />
      </div>
      <style jsx>{`
        @keyframes loading {
          0% {
            width: 0;
            margin-left: 0;
          }
          50% {
            width: 60%;
            margin-left: 20%;
          }
          100% {
            width: 100%;
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}