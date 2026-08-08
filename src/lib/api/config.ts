/**
 * Centralized API Configuration for LeadForge AI
 * Handles API base URL resolution and endpoint path normalization.
 */

export const getBaseUrl = (): string => {
  // Check if explicit environment variable is defined in Vite import.meta or process.env or window
  const metaEnv = (import.meta as any).env || {};
  const procEnv = (typeof process !== 'undefined' ? process.env : {}) || {};
  const winEnv = (typeof window !== 'undefined' ? (window as any).__ENV__ : {}) || {};

  const envUrl =
    metaEnv.VITE_API_URL ||
    metaEnv.VITE_BACKEND_URL ||
    metaEnv.VITE_API_BASE_URL ||
    metaEnv.NEXT_PUBLIC_API_URL ||
    metaEnv.NEXT_PUBLIC_BACKEND_URL ||
    metaEnv.NEXT_PUBLIC_API_BASE_URL ||
    procEnv.VITE_API_URL ||
    procEnv.VITE_BACKEND_URL ||
    procEnv.NEXT_PUBLIC_API_URL ||
    procEnv.NEXT_PUBLIC_BACKEND_URL ||
    winEnv.API_URL ||
    winEnv.BACKEND_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }
  // Default to relative root for unified full-stack architecture
  return '';
};

export const API_CONFIG = {
  get baseUrl(): string {
    return getBaseUrl();
  },
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
