/**
 * Centralized API Configuration for LeadForge AI
 * Handles API base URL resolution and endpoint path normalization.
 */

export const getBaseUrl = (): string => {
  // Check if explicit environment variable is defined
  const envUrl = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.NEXT_PUBLIC_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }
  // Default to relative root for unified full-stack architecture
  return '';
};

export const API_CONFIG = {
  baseUrl: getBaseUrl(),
  endpoints: {
    health: '/healthz',
    readiness: '/readyz',
    search: '/api/search',
    adminTelemetry: '/api/admin/telemetry',
    analyticsEvent: '/api/analytics/event',
    geminiAnalyze: '/api/gemini/analyze',
    geminiOutreach: '/api/gemini/generate-outreach'
  }
};

/**
 * Constructs a fully normalized URL without duplicate path segments or trailing slashes
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getBaseUrl();
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Prevent duplicate /api/api/ path issues if baseUrl ends with /api
  if (baseUrl.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4);
  }

  return `${baseUrl}${cleanEndpoint}`;
};
