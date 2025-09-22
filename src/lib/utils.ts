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

  // If it's already a full URL (including Supabase URLs), return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If it starts with data: (base64 image), return as is
  if (path.startsWith('data:')) {
    return path;
  }

  // Get the backend base URL (without /api)
  // const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://reviews-backend-2zkw.onrender.com';

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
  if (!path || path === '') return fallback;

  try {
    const url = getAssetUrl(path);
    // Validate the URL
    if (url && url !== '') {
      // Check if it's a valid URL or a local path
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('/')) {
        // Additional check for Supabase URLs to ensure they're valid
        if (url.includes('supabase.co/storage/') || url.includes('supabase.com/storage/')) {
          // Supabase URLs are always valid
          return url;
        }
        return url;
      }
    }
    return fallback;
  } catch (error) {
    console.error('Error processing image URL:', path, error);
    return fallback;
  }
}