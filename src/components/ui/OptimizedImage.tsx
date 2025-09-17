'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  BLUR_DATA_URL,
  getResponsiveSizes,
  getImageQuality,
  getImageFormat,
  isValidImageUrl
} from '@/lib/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  sizeType?: 'hero' | 'card' | 'thumbnail' | 'avatar' | 'full';
  quality?: number;
  qualityPriority?: 'high' | 'medium' | 'low';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  style?: React.CSSProperties;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  sizeType,
  quality,
  qualityPriority = 'medium',
  placeholder = 'blur',
  blurDataURL = BLUR_DATA_URL,
  objectFit = 'cover',
  style,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Validate image URL
  const isValid = isValidImageUrl(src);
  const imageFormat = getImageFormat(src);

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || (sizeType ? getResponsiveSizes(sizeType) : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw');

  // Determine quality based on format
  const imageQuality = quality || getImageQuality(qualityPriority, imageFormat);

  // Fallback image for invalid URLs or errors
  const fallbackSrc = '/images/placeholder.jpg';
  const imageSrc = isValid ? src : fallbackSrc;

  if (error) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}
           style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}>
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const imageProps = fill
    ? { fill: true }
    : { width: width || 500, height: height || 500 };

  return (
    <div className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}>
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`} />
      )}
      <Image
        {...imageProps}
        src={imageSrc}
        alt={alt}
        quality={imageQuality}
        sizes={responsiveSizes}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ objectFit, ...style }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}