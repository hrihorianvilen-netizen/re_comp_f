/**
 * Utility functions for the application
 */

/**
 * Constructs a full URL for backend assets like images
 * @param path - The relative path returned from backend (e.g., '/uploads/merchants/logo.jpg')
 * @returns The full URL that can be used in img src
 */
export function getAssetUrl(path: string | null | undefined): string {
  if (!path) return '';
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Get the backend base URL (without /api)
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://reviews-xu3f.onrender.com';
  
  // Construct and return the full URL
  return `${baseUrl}${path}`;
}

/**
 * Gets the image URL with a fallback
 * @param path - The image path from backend
 * @param fallback - Fallback image path if main path is empty
 * @returns The full image URL or fallback
 */
export function getImageUrl(path: string | null | undefined, fallback: string = '/images/placeholder.jpg'): string {
  if (!path) return fallback;
  return getAssetUrl(path);
}