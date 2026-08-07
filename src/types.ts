export type OpportunityLevel = 'prime' | 'high' | 'medium' | 'low';

export type CrmStage = 'new' | 'contacted' | 'interested' | 'proposal' | 'won' | 'lost';

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  linkedin?: string;
  tiktok?: string;
  pinterest?: string;
  youtube?: string;
  threads?: string;
  x?: string;
}

export interface WebsiteAudit {
  hasWebsite: boolean;
  sslValid: boolean;
  speedScore: number; // 0-100
  loadTimeMs: number;
  mobileFriendly: boolean;
  brokenLinksCount: number;
  seoScore: number; // 0-100
  accessibilityScore: number; // 0-100
  hasMetaTags: boolean;
  hasAnalytics: boolean;
  hasFacebookPixel: boolean;
  hasSchemaOrg: boolean;
  cmsDetected?: string; // e.g. WordPress, Wix, Squarespace, Custom
  hostingProvider?: string;
  domainAgeYears: number;
  isDomainExpired: boolean;
  hasContactForm: boolean;
  hasOnlineBooking: boolean;
  hasLiveChat: boolean;
}

export interface BusinessLead {
  id: string;
  name: string;
  industry: string;
  category: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  phone: string;
  email: string;
  website?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  social: SocialLinks;
  googleRating: number;
  reviewCount: number;
  googlePlaceId?: string | null;
  googleMapsUrl?: string | null;
  googleMapsVerified?: boolean;
  googleMapsLastVerifiedAt?: string | null;
  googleMapsSource?: string | null;
  businessHours: string;
  openNow: boolean;
  isVerified: boolean;
  isClaimed: boolean;
  businessSize: '1-5' | '6-20' | '21-50' | '50+';
  opportunityScore: number; // 0-100 (higher score = bigger digital service sales opportunity)
  websiteQualityScore: number; // 0-100
  leadScore: number; // 0-100 overall priority
  opportunityLevel: OpportunityLevel;
  crmStatus: CrmStage;
  dealValue: number;
  notes: string[];
  tasks: { id: string; title: string; dueDate: string; completed: boolean }[];
  tags: string[];
  techStack: string[];
  websiteAudit: WebsiteAudit;
  aiOpportunityHighlights: string[];
  aiRecommendedServices: string[];
  dateAdded: string;
  isFavorite: boolean;
  lastContacted?: string;
}

export interface SearchFilters {
  industry: string;
  city: string;
  state: string;
  country: string;
  radiusKm: number;
  keyword: string;
  noWebsiteOnly: boolean;
  hasFacebookOnly: boolean;
  hasInstagramOnly: boolean;
  hasWhatsAppOnly: boolean;
  hasEmailOnly: boolean;
  hasPhoneOnly: boolean;
  noSslOnly: boolean;
  mobileUnfriendlyOnly: boolean;
  minRating: number;
  minReviews: number;
  verifiedOnly: boolean;
  openNowOnly: boolean;
  recentlyAddedOnly: boolean;
  businessSize: string;
}

export interface CrmTask {
  id: string;
  leadId: string;
  leadName: string;
  title: string;
  dueDate: string;
  type: 'call' | 'email' | 'meeting' | 'proposal' | 'followup';
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface AutomationSequence {
  id: string;
  name: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'facebook';
  status: 'active' | 'paused' | 'draft';
  triggerEvent: string;
  stepsCount: number;
  leadsEnrolled: number;
  openRate: number;
  responseRate: number;
  createdAt: string;
  steps: {
    delayDays: number;
    subject?: string;
    template: string;
  }[];
}

export interface UserProfile {
  name: string;
  email: string;
  agencyName: string;
  avatarUrl: string;
  plan: 'Starter' | 'Agency Pro' | 'Enterprise AI';
  creditsRemaining: number;
  totalCredits: number;
  todaySearchesCount: number;
  totalLeadsDiscovered: number;
  apiKey: string;
  theme: 'dark' | 'light';
}

export interface AIOutreachResponse {
  coldEmail: {
    subject: string;
    body: string;
    valueProposition: string;
  };
  socialDms: {
    facebook: string;
    instagram: string;
    whatsapp: string;
  };
  salesPitch: {
    elevatorPitch: string;
    phoneScript: string;
    objectionHandling: { objection: string; response: string }[];
  };
  salesProposal: {
    executiveSummary: string;
    identifiedFlaws: string[];
    proposedSolutions: string[];
    estimatedRoi: string;
    pricingPackages: { tier: string; price: string; deliverables: string[] }[];
  };
}
