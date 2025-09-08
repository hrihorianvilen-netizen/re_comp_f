'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import RatingStars from './RatingStars';
import { getImageUrl } from '@/lib/utils';
import api from '@/lib/api';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface RecentlyViewedItem {
  id: string;
  slug?: string;
  name: string;
  image: string;
  rating: number;
  uniqueKey?: string;
}

interface RecentlyViewedSwiperProps {
  items: RecentlyViewedItem[];
}

export default function RecentlyViewedSwiper({ items }: RecentlyViewedSwiperProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  // Track merchant visit
  const handleMerchantClick = async (merchantSlug: string) => {
    try {
      await api.trackMerchantVisit(merchantSlug);
    } catch (error) {
      console.error('Failed to track merchant visit:', error);
      // Don't block navigation on tracking failure
    }
  };

  return (
    <div className="w-full py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Merchants</h2>
        
        {items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No recent merchants to display yet.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon as users browse merchants!</p>
          </div>
        ) : (
        
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={6}
          navigation
          pagination={{ clickable: true }}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: {
              slidesPerView: 2,
            },
            640: {
              slidesPerView: 3,
            },
            768: {
              slidesPerView: 4,
            },
            1024: {
              slidesPerView: 5,
            },
            1280: {
              slidesPerView: 6,
            },
          }}
          className="recently-viewed-swiper"
        >
          {items.map((item) => (
            <SwiperSlide key={item.uniqueKey || item.id}>
              <Link 
                href={`/merchants/${item.slug || item.id}`}
                onClick={() => handleMerchantClick(item.slug || item.id)}
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {item.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <RatingStars rating={item.rating} size={20} />
                      <span className="text-sm font-medium text-gray-700">
                        {item.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
        )}
      </div>

      <style jsx global>{`
        .recently-viewed-swiper .swiper-button-next,
        .recently-viewed-swiper .swiper-button-prev {
          color: #a56b00;
          background: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .recently-viewed-swiper .swiper-button-next:after,
        .recently-viewed-swiper .swiper-button-prev:after {
          font-size: 20px;
        }
        
        .recently-viewed-swiper .swiper-pagination-bullet-active {
          background: #a56b00;
        }
      `}</style>
    </div>
  );
}