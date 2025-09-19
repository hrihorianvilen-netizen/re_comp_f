/**
 * Strip HTML tags from a string
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Truncate HTML content to a specific length (strips HTML first)
 */
export function truncateHtml(html: string, length: number): string {
  const stripped = stripHtmlTags(html);
  if (stripped.length <= length) return stripped;
  return stripped.substring(0, length) + '...';
}

/**
 * Get a safe preview of HTML content for list displays
 */
export function getHtmlPreview(html: string, maxLength: number = 150): string {
  return truncateHtml(html, maxLength);
}