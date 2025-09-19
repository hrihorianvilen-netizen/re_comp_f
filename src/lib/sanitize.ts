import DOMPurify from 'dompurify';

/**
 * Sanitization configuration for rich text content
 */
export const ALLOWED_TAGS = [
  'p', 'br', 'b', 'strong', 'i', 'em', 'u', 'h3', 'h4', 'span'
];

export const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  // No attributes needed for basic formatting
};

export interface SanitizeOptions {
  maxLength?: number;
  minLength?: number;
  maxLinks?: number;
  maxImages?: number;
  stripUTM?: boolean;
}

/**
 * Validates content against rules
 */
export function validateContent(html: string, options: SanitizeOptions = {}): {
  isValid: boolean;
  errors: string[];
} {
  const {
    maxLength = 3000,
    minLength = 10,
    maxLinks = 20,
    maxImages = 10
  } = options;

  const errors: string[] = [];

  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Check text length (without HTML tags)
  const textContent = temp.textContent || '';
  const charCount = textContent.length;

  if (charCount < minLength) {
    errors.push(`Content must be at least ${minLength} characters`);
  }

  if (charCount > maxLength) {
    errors.push(`Content cannot exceed ${maxLength} characters`);
  }

  // Count links
  const links = temp.querySelectorAll('a');
  if (links.length > maxLinks) {
    errors.push(`Maximum ${maxLinks} links allowed`);
  }

  // Count images
  const images = temp.querySelectorAll('img');
  if (images.length > maxImages) {
    errors.push(`Maximum ${maxImages} images allowed`);
  }

  // Check for missing alt text on images
  images.forEach((img, index) => {
    const alt = img.getAttribute('alt');
    if (!alt || alt.length < 3 || alt.length > 120) {
      errors.push(`Image ${index + 1}: Alt text must be 3-120 characters`);
    }
  });

  // Check for spam patterns
  const consecutiveNonSpace = /[^\s]{71,}/;
  if (consecutiveNonSpace.test(textContent)) {
    errors.push('Text contains too many consecutive characters without spaces');
  }

  const repeatedChars = /(.)\1{6,}/;
  if (repeatedChars.test(textContent)) {
    errors.push('Text contains too many repeated characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes HTML content according to security rules
 */
export function sanitizeHtml(html: string, options: SanitizeOptions = {}): string {
  const { stripUTM = true } = options;

  // Configure DOMPurify
  const config = {
    ALLOWED_TAGS,
    ALLOWED_ATTR: Object.keys(ALLOWED_ATTRIBUTES).reduce((acc, tag) => {
      return acc.concat(ALLOWED_ATTRIBUTES[tag as keyof typeof ALLOWED_ATTRIBUTES] || []);
    }, [] as string[]),
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i,
    KEEP_CONTENT: true,
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['class', 'id', 'onclick', 'onload', 'onerror']
  };

  const sanitized = DOMPurify.sanitize(html, config);

  // Post-process to add security attributes and clean URLs
  const temp = document.createElement('div');
  temp.innerHTML = sanitized;

  // Process links
  temp.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      // Strip UTM parameters if enabled
      if (stripUTM) {
        try {
          const url = new URL(href, window.location.origin);
          ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
            url.searchParams.delete(param);
          });
          link.setAttribute('href', url.toString());
        } catch {
          // Invalid URL, keep as is
        }
      }

      // Add security attributes
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'nofollow noopener noreferrer');
    }
  });

  // Process images - ensure they use internal CDN if configured
  temp.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('data:')) {
      // Remove base64 images
      img.remove();
    }
  });

  return temp.innerHTML;
}

/**
 * Counts characters in HTML content (excluding tags)
 */
export function countCharacters(html: string): number {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return (temp.textContent || '').length;
}

/**
 * Extracts plain text from HTML
 */
export function htmlToPlainText(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || '';
}

/**
 * Truncates HTML content while preserving structure
 */
export function truncateHtml(html: string, maxLength: number): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const text = temp.textContent || '';

  if (text.length <= maxLength) {
    return html;
  }

  // Simple truncation - for complex HTML structure preservation,
  // you'd need a more sophisticated algorithm
  const truncatedText = text.substring(0, maxLength) + '...';
  return `<p>${truncatedText}</p>`;
}