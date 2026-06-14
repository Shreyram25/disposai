/**
 * Placeholder images for medicines when no image is available
 */

/**
 * SVG placeholder for a medicine tablet/pill
 * Returns a data URL for a simple tablet icon
 */
export const getTabletPlaceholder = (): string => {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <linearGradient id="tabletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#e0e7ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#c7d2fe;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Background -->
      <rect width="200" height="200" fill="url(#tabletGrad)" rx="20"/>
      <!-- Tablet shape -->
      <ellipse cx="100" cy="100" rx="60" ry="35" fill="#6366f1" opacity="0.9"/>
      <ellipse cx="100" cy="100" rx="55" ry="32" fill="#818cf8"/>
      <!-- Score line -->
      <line x1="100" y1="68" x2="100" y2="132" stroke="#4f46e5" stroke-width="3" stroke-linecap="round"/>
      <!-- Pill shape alternative -->
      <ellipse cx="100" cy="100" rx="50" ry="30" fill="none" stroke="#4f46e5" stroke-width="2" opacity="0.5"/>
    </svg>
  `)}`;
};

/**
 * Get image URL with fallback to placeholder
 */
export const getImageWithFallback = (imageUrl: string | null | undefined): string => {
  if (imageUrl && imageUrl.trim() !== '') {
    return imageUrl;
  }
  return getTabletPlaceholder();
};

