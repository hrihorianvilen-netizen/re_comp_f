/**
 * Frontend Vietnamese Slug Utilities
 * Provides consistent slug generation and validation across the application
 */

// Vietnamese character normalization function
const normalizeVietnamese = (str: string): string => {
  const vietnameseMap: Record<string, string> = {
    // a variants
    'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    // e variants
    'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    // i variants
    'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    // o variants
    'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    // u variants
    'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    // y variants
    'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    // d variants
    'đ': 'd',
    // uppercase variants
    'Á': 'A', 'À': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Â': 'A', 'Ấ': 'A', 'Ầ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'Ă': 'A', 'Ắ': 'A', 'Ằ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'É': 'E', 'È': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ế': 'E', 'Ề': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Í': 'I', 'Ì': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ó': 'O', 'Ò': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ố': 'O', 'Ồ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ớ': 'O', 'Ờ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ú': 'U', 'Ù': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ứ': 'U', 'Ừ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ý': 'Y', 'Ỳ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
    'Đ': 'D'
  };

  return str.split('').map(char => vietnameseMap[char] || char).join('');
};

/**
 * Generate slug with Vietnamese normalization
 * Follows Vietnamese slug rules:
 * - All lowercase
 * - Words separated by hyphen (-)
 * - No spaces, underscores, or special characters
 * - Vietnamese diacritics normalized to non-accented Latin characters
 * - Only [a-z0-9-] allowed
 * - No consecutive hyphens (--)
 * - No leading/trailing hyphens
 */
export const generateSlug = (input: string): string => {
  if (!input) return '';

  // First normalize Vietnamese characters
  const normalized = normalizeVietnamese(input);

  // Convert to lowercase and replace spaces/special chars with hyphens
  const slug = normalized
    .toLowerCase()
    .trim()
    // Replace spaces and common separators with hyphens
    .replace(/[\s_,.\|\\\/]+/g, '-')
    // Remove all non-alphanumeric and non-hyphen characters
    .replace(/[^a-z0-9-]/g, '')
    // Replace consecutive hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  return slug;
};

/**
 * Validate slug format according to Vietnamese slug rules
 */
export const validateSlugFormat = (slug: string): { isValid: boolean; error?: string } => {
  if (!slug) {
    return { isValid: false, error: 'Slug is required' };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { isValid: false, error: 'Slug can only contain lowercase letters, numbers, and hyphens' };
  }

  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { isValid: false, error: 'Slug cannot start or end with a hyphen' };
  }

  if (/--/.test(slug)) {
    return { isValid: false, error: 'Slug cannot contain consecutive hyphens' };
  }

  return { isValid: true };
};

/**
 * Auto-generate slug from name/title with real-time preview
 * Useful for form inputs where user can see slug being generated
 */
export const autoGenerateSlug = (input: string, maxLength: number = 50): string => {
  const slug = generateSlug(input);
  return slug.length > maxLength ? slug.substring(0, maxLength).replace(/-+$/, '') : slug;
};

/**
 * Format slug for display (useful for showing user what the URL will look like)
 */
export const formatSlugPreview = (slug: string, baseUrl: string = ''): string => {
  if (!slug) return '';
  const cleanSlug = generateSlug(slug);
  return baseUrl ? `${baseUrl}/${cleanSlug}` : cleanSlug;
};

/**
 * Get validation errors for slug input
 * Returns array of error messages for UI display
 */
export const getSlugValidationErrors = (slug: string): string[] => {
  const errors: string[] = [];

  if (!slug) {
    errors.push('Slug is required');
    return errors;
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
  }

  if (slug.startsWith('-') || slug.endsWith('-')) {
    errors.push('Slug cannot start or end with a hyphen');
  }

  if (/--/.test(slug)) {
    errors.push('Slug cannot contain consecutive hyphens');
  }

  if (slug.length < 2) {
    errors.push('Slug must be at least 2 characters long');
  }

  if (slug.length > 100) {
    errors.push('Slug cannot be longer than 100 characters');
  }

  return errors;
};

/**
 * Debounced slug generator for form inputs
 * Prevents excessive API calls when user is typing
 */
export const createDebouncedSlugGenerator = (
  callback: (slug: string) => void,
  delay: number = 300
): (input: string) => void => {
  let timeoutId: NodeJS.Timeout;

  return (input: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const slug = autoGenerateSlug(input);
      callback(slug);
    }, delay);
  };
};

/**
 * Hook for managing slug state in React components
 */
export const useSlugState = (initialValue: string = '') => {
  const [slug, setSlug] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const updateSlug = (newSlug: string) => {
    setSlug(newSlug);
    const validationErrors = getSlugValidationErrors(newSlug);
    setErrors(validationErrors);
    setIsValid(validationErrors.length === 0);
  };

  const generateFromInput = (input: string) => {
    const generated = autoGenerateSlug(input);
    updateSlug(generated);
    return generated;
  };

  return {
    slug,
    isValid,
    errors,
    updateSlug,
    generateFromInput,
    validate: () => validateSlugFormat(slug)
  };
};

// Import useState for the hook
import { useState } from 'react';