// Helper to construct full URL for static assets, especially those under /uploads
// Works in dev and prod. If the path starts with /uploads, prefix with backend origin.
// Derives origin from VITE_STATIC_BASE_URL or VITE_API_BASE_URL with trailing /api or /api/vX removed.

const stripApiSuffix = (baseUrl) => {
  if (!baseUrl) return '';
  try {
    // Remove trailing /api, optionally with version (e.g., /api, /api/v1, /api/v2)
    return baseUrl.replace(/\/api(\/v\d+)?\/?$/i, '');
  } catch {
    return baseUrl;
  }
};

export const getAssetBaseUrl = () => {
  const staticBase = import.meta.env.VITE_STATIC_BASE_URL;
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  const origin = staticBase || stripApiSuffix(apiBase);
  return origin || window.location.origin;
};

export const getAssetUrl = (urlOrPath) => {
  if (!urlOrPath) return urlOrPath;
  // Absolute http(s) URL: return as-is
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;
  const base = getAssetBaseUrl();
  // Ensure leading slash
  const path = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  // If already under /uploads or other server-served path, just prefix origin
  return `${base}${path}`;
};