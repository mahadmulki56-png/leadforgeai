/**
 * Centralized API Client for LeadForge AI Backend Services
 */

import { SearchFilters, BusinessLead } from '../../types';
import { API_CONFIG, buildApiUrl } from './config';

export interface SearchApiResponse {
  searchId: string;
  results: BusinessLead[];
  totalDiscovered: number;
  provider: string;
  latencyMs: number;
  dataQualityReport?: any;
  suggestions?: string[];
  requestId?: string;
}

export interface ApiErrorDetails {
  status?: number;
  endpoint?: string;
  requestUrl?: string;
  apiBaseUrl?: string;
  message: string;
  rawError?: any;
}

class ApiClient {
  private lastHealthCheckTime: number = 0;
  private isServerHealthy: boolean = false;

  /**
   * Helper to format full endpoint URL
   */
  private getEndpointUrl(path: string): string {
    return buildApiUrl(path);
  }

  /**
   * Verify server health via /healthz endpoint
   */
  async checkHealth(): Promise<any> {
    const data = await this.request<any>(API_CONFIG.endpoints.health, { method: 'GET' });
    if (data && (data.status === 'ok' || data.status === 'healthy')) {
      this.isServerHealthy = true;
      this.lastHealthCheckTime = Date.now();
    }
    return data;
  }

  /**
   * Pre-flight connectivity verification before critical requests
   */
  async ensureHealthy(force: boolean = false): Promise<void> {
    const maxAge = 30000; // Cache health check for 30s
    if (!force && this.isServerHealthy && (Date.now() - this.lastHealthCheckTime < maxAge)) {
      return;
    }

    try {
      await this.checkHealth();
    } catch (err: any) {
      this.isServerHealthy = false;
      let statusCode = 503;
      let msg = 'Backend search service is unreachable. Health check failed.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.status) statusCode = parsed.status;
        if (parsed.message) msg = `Backend health check failed: ${parsed.message}`;
      } catch (e) {
        // Fallthrough
      }
      const healthUrl = this.getEndpointUrl(API_CONFIG.endpoints.health);
      throw new Error(JSON.stringify({
        status: statusCode,
        endpoint: API_CONFIG.endpoints.health,
        requestUrl: healthUrl,
        apiBaseUrl: API_CONFIG.baseUrl,
        message: msg
      }));
    }
  }

  /**
   * Generic request wrapper with request tracking and structured error throwing
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = this.getEndpointUrl(endpoint);
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: await response.text().catch(() => response.statusText) };
        }

        const errorMessage = errorData.message || errorData.error || `HTTP ${response.status} error from ${endpoint}`;
        
        const errorObj: ApiErrorDetails = {
          status: response.status,
          endpoint,
          requestUrl: url,
          apiBaseUrl: API_CONFIG.baseUrl,
          message: errorMessage,
          rawError: errorData
        };

        throw new Error(JSON.stringify(errorObj));
      }

      return await response.json();
    } catch (err: any) {
      // If error was already wrapped, rethrow
      try {
        const parsed = JSON.parse(err.message);
        if (parsed && parsed.endpoint) throw err;
      } catch (e) {
        // Fallthrough
      }

      const fallbackError: ApiErrorDetails = {
        endpoint,
        requestUrl: url,
        apiBaseUrl: API_CONFIG.baseUrl,
        message: err.message || 'Network request failed'
      };
      throw new Error(JSON.stringify(fallbackError));
    }
  }

  /**
   * Execute real business search against primary /api/search endpoint with health check verification
   */
  async searchBusinesses(filters: SearchFilters): Promise<SearchApiResponse> {
    // Perform health check pre-flight verification
    await this.ensureHealthy();

    const payload = {
      industry: filters.industry === 'All Industries' ? 'Local Services' : filters.industry,
      city: filters.city || 'Austin',
      state: filters.state || 'TX',
      country: filters.country || 'United States',
      radiusKm: filters.radiusKm || 25,
      keyword: filters.keyword || '',
      noWebsiteOnly: filters.noWebsiteOnly,
      noSslOnly: filters.noSslOnly,
      hasFacebookOnly: filters.hasFacebookOnly,
      hasInstagramOnly: filters.hasInstagramOnly,
      minRating: filters.minRating || 0,
      minReviews: filters.minReviews || 0
    };

    return this.request<SearchApiResponse>(API_CONFIG.endpoints.search, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Readiness Check
   */
  async checkReadiness(): Promise<any> {
    return this.request<any>(API_CONFIG.endpoints.readiness, { method: 'GET' });
  }

  /**
   * Fetch Telemetry Stats
   */
  async getTelemetry(): Promise<any> {
    return this.request<any>(API_CONFIG.endpoints.adminTelemetry, { method: 'GET' });
  }

  /**
   * Track Analytics Event
   */
  async trackAnalyticsEvent(eventData: any): Promise<any> {
    return this.request<any>(API_CONFIG.endpoints.analyticsEvent, {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  /**
   * Generate Gemini AI Lead Analysis
   */
  async analyzeLead(leadData: any): Promise<any> {
    return this.request<any>(API_CONFIG.endpoints.geminiAnalyze, {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  }

  /**
   * Generate Gemini AI Outreach Kit
   */
  async generateOutreach(leadData: any): Promise<any> {
    return this.request<any>(API_CONFIG.endpoints.geminiOutreach, {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  }
}

export const apiClient = new ApiClient();

