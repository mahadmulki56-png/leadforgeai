import React from 'react';

/**
 * Google Maps Verification & Analytics Utilities
 */

/**
 * Validates that a Google Maps URL is HTTPS, belongs to an approved Google Maps domain,
 * and contains no malformed scripts or open-redirect vulnerabilities.
 */
export function validateGoogleMapsUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Must be HTTPS
  if (!trimmed.startsWith('https://')) return null;

  // Prevent script injections or HTML tags
  if (trimmed.toLowerCase().includes('javascript:') || trimmed.includes('<') || trimmed.includes('>')) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();

    const isApprovedDomain = 
      hostname === 'google.com' ||
      hostname.endsWith('.google.com') ||
      hostname === 'maps.google.com' ||
      hostname === 'maps.app.goo.gl' ||
      hostname === 'goo.gl';

    if (!isApprovedDomain) return null;

    return trimmed;
  } catch (e) {
    return null;
  }
}

/**
 * Constructs a canonical Google Maps URL from an officially verified Google Place ID.
 * Example: https://www.google.com/maps/place/?q=place_id:ChIJN1t_tDe1RIYR54TF4A3q4D0
 */
export function formatGooglePlaceUrl(placeId: string | null | undefined): string | null {
  if (!placeId || typeof placeId !== 'string') return null;
  const cleanId = placeId.trim();
  if (!cleanId || cleanId.length < 5 || cleanId.includes(' ') || cleanId.includes('<')) return null;

  const canonicalUrl = `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(cleanId)}`;
  return validateGoogleMapsUrl(canonicalUrl);
}

export interface VerificationConsistencyResult {
  isConsistent: boolean;
  mismatchReason?: string;
  hasVerification: boolean;
}

/**
 * Checks for data consistency between business records and Google Maps verification claims.
 */
export function checkGoogleMapsConsistency(lead: {
  name: string;
  address?: string;
  phone?: string;
  googlePlaceId?: string | null;
  googleMapsUrl?: string | null;
  googleMapsVerified?: boolean;
}): VerificationConsistencyResult {
  const verified = Boolean(lead.googleMapsVerified);
  const validUrl = validateGoogleMapsUrl(lead.googleMapsUrl);

  if (verified && (!validUrl && !lead.googlePlaceId)) {
    return {
      isConsistent: false,
      mismatchReason: 'Verification Mismatch: Claimed verified but no valid Google Place ID or URL',
      hasVerification: false
    };
  }

  if (lead.googleMapsUrl && !validUrl) {
    return {
      isConsistent: false,
      mismatchReason: 'Verification Mismatch: Provided URL fails security validation',
      hasVerification: false
    };
  }

  return {
    isConsistent: true,
    hasVerification: verified && (Boolean(validUrl) || Boolean(lead.googlePlaceId))
  };
}

/**
 * Sends a tracking event when a user opens a business listing on Google Maps.
 */
export function trackGoogleMapsOpened(params: {
  userId?: string;
  businessId: string;
  searchId?: string;
  businessName?: string;
}) {
  const payload = {
    event: 'GOOGLE_MAPS_OPENED',
    userId: params.userId || 'usr_anonymous',
    businessId: params.businessId,
    businessName: params.businessName || '',
    searchId: params.searchId || '',
    timestamp: new Date().toISOString()
  };

  // Asynchronous beacon to backend
  try {
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (e) {
    // Ignore analytics network errors silently
  }
}

/**
 * Handler for clicking "View on Google Maps" buttons across the application.
 */
export function handleGoogleMapsClick(
  e: React.MouseEvent,
  url: string | null | undefined,
  businessId: string,
  businessName?: string,
  searchId?: string,
  userId?: string
) {
  e.stopPropagation();

  const validUrl = validateGoogleMapsUrl(url);
  if (!validUrl) {
    alert('Google Maps listing is unavailable for this business.');
    return;
  }

  trackGoogleMapsOpened({
    userId,
    businessId,
    businessName,
    searchId
  });

  window.open(validUrl, '_blank', 'noopener,noreferrer');
}
