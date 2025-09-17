// Image optimization utilities

// Supported image formats
export const SUPPORTED_IMAGE_FORMATS = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'gif', 'svg', 'bmp', 'ico'];

// Check if URL is a valid image
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  const extension = url.split('.').pop()?.toLowerCase();
  return extension ? SUPPORTED_IMAGE_FORMATS.includes(extension) : false;
};

// Get image format from URL
export const getImageFormat = (url: string): string | null => {
  if (!url) return null;
  const extension = url.split('.').pop()?.toLowerCase();
  // Normalize jpg to jpeg
  if (extension === 'jpg') return 'jpeg';
  return extension && SUPPORTED_IMAGE_FORMATS.includes(extension) ? extension : null;
};

// Generate responsive image sizes attribute
export const getResponsiveSizes = (type: 'hero' | 'card' | 'thumbnail' | 'avatar' | 'full') => {
  switch (type) {
    case 'hero':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px';
    case 'card':
      return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
    case 'thumbnail':
      return '(max-width: 640px) 25vw, 150px';
    case 'avatar':
      return '48px';
    case 'full':
      return '100vw';
    default:
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  }
};

// Quality settings based on image importance and format
export const getImageQuality = (priority: 'high' | 'medium' | 'low', format?: string | null) => {
  // PNG images typically need higher quality to maintain transparency
  const isPng = format === 'png';

  switch (priority) {
    case 'high':
      return isPng ? 95 : 90;
    case 'medium':
      return isPng ? 85 : 75;
    case 'low':
      return isPng ? 75 : 60;
    default:
      return isPng ? 85 : 75;
  }
};

// Get optimal format based on image characteristics
export const getOptimalFormat = (originalFormat: string | null, hasTransparency: boolean = false): string[] => {
  // If transparency is needed, use WebP/PNG
  if (hasTransparency || originalFormat === 'png' || originalFormat === 'gif') {
    return ['image/webp', 'image/png'];
  }

  // For photos and non-transparent images, use AVIF/WebP/JPEG
  return ['image/avif', 'image/webp', 'image/jpeg'];
};

// Blur data URL for placeholder (base64 encoded tiny version)
export const BLUR_DATA_URL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

// Image loading priorities
export const shouldPrioritizeImage = (index: number, threshold: number = 3): boolean => {
  return index < threshold;
};

// Calculate aspect ratio
export const getAspectRatio = (width: number, height: number): number => {
  return width / height;
};

// Get optimized image dimensions
export const getOptimizedDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = Math.round(width / aspectRatio);
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }

  return { width, height };
};