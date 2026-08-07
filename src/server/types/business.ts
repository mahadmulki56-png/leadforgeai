export type WebsiteStatus =
  | 'NO_WEBSITE'
  | 'ACTIVE_WEBSITE'
  | 'BROKEN_WEBSITE'
  | 'REDIRECT_ONLY'
  | 'PARKED_DOMAIN'
  | 'UNREACHABLE'
  | 'UNKNOWN';

export type DataSourceType =
  | 'GOOGLE_PLACES_API'
  | 'OPENSTREETMAP_OVERPASS'
  | 'OFFICIAL_WEBSITE_AUDIT'
  | 'LICENSED_ENRICHMENT'
  | 'USER_PROVIDED';

export type DataConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface SearchParams {
  industry: string;
  city: string;
  state: string;
  country?: string;
  radiusKm?: number;
  keyword?: string;
  noWebsiteOnly?: boolean;
  noSslOnly?: boolean;
  hasFacebookOnly?: boolean;
  hasInstagramOnly?: boolean;
  hasWhatsAppOnly?: boolean;
  hasEmailOnly?: boolean;
  hasPhoneOnly?: boolean;
  minRating?: number;
  minReviews?: number;
  page?: number;
  pageSize?: number;
}

export interface RawProviderBusiness {
  provider: string;
  providerBusinessId: string;
  name: string;
  category: string;
  categories: string[];
  address: string;
  street?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  googlePlaceId?: string | null;
  googleMapsUrl?: string | null;
  googleMapsVerified?: boolean;
  googleMapsLastVerifiedAt?: string | null;
  googleMapsSource?: string | null;
  openNow?: boolean;
  placeTypes?: string[];
  social?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    whatsapp?: string;
  };
}

export interface SourceTransparency {
  nameSource: DataSourceType;
  phoneSource: DataSourceType;
  websiteSource: DataSourceType;
  ratingSource: DataSourceType;
  socialSource: DataSourceType;
}

export interface DataQualityReport {
  totalDiscovered: number;
  duplicatesRemoved: number;
  verifiedCount: number;
  partialCount: number;
  averageConfidence: number;
  providerName: string;
  verificationLatencyMs: number;
}

export interface SearchResponsePayload {
  searchId: string;
  query: {
    industry: string;
    city: string;
    state: string;
    country: string;
    radiusKm: number;
  };
  total: number;
  results: any[]; // Normalized BusinessLead
  provider: string;
  generatedAt: string;
  dataQuality: DataQualityReport;
  suggestions?: string[];
}
