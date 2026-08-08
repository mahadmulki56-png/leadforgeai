import { API_CONFIG } from './config';

export interface RouteInfo {
  path: string | string[];
  methods: string[];
}

export interface DiagnosticData {
  service?: string;
  environment?: string;
  totalRoutes?: number;
  routes?: RouteInfo[];
  rawResponse?: any;
  error?: string;
}

export async function fetchDebugRoutes(): Promise<DiagnosticData> {
  const primaryUrl = `${API_CONFIG.baseUrl}/debug/routes`;
  const fallbackUrl = `${API_CONFIG.baseUrl}/api/debug/routes`;

  try {
    const res = await fetch(primaryUrl, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    // Attempt fallback route
  }

  try {
    const res = await fetch(fallbackUrl, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return {
      error: `HTTP ${res.status}: Failed to load routes from ${fallbackUrl}`
    };
  } catch (err: any) {
    return {
      error: err.message || 'Network error attempting to fetch diagnostic routes'
    };
  }
}
