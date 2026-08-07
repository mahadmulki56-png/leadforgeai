import { WebsiteAudit, SocialLinks } from '../../types';
import { WebsiteStatus } from '../types/business';

export interface WebsiteVerificationResult {
  status: WebsiteStatus;
  statusConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  audit: WebsiteAudit;
  extractedSocial: SocialLinks;
  extractedEmail?: string;
  extractedPhone?: string;
}

export async function verifyAndEnrichWebsite(
  rawUrl?: string,
  businessName?: string
): Promise<WebsiteVerificationResult> {
  const defaultAudit: WebsiteAudit = {
    hasWebsite: false,
    sslValid: false,
    speedScore: 0,
    loadTimeMs: 0,
    mobileFriendly: false,
    brokenLinksCount: 0,
    seoScore: 0,
    accessibilityScore: 0,
    hasMetaTags: false,
    hasAnalytics: false,
    hasFacebookPixel: false,
    hasSchemaOrg: false,
    domainAgeYears: 0,
    isDomainExpired: false,
    hasContactForm: false,
    hasOnlineBooking: false,
    hasLiveChat: false
  };

  const emptyResult: WebsiteVerificationResult = {
    status: 'NO_WEBSITE',
    statusConfidence: 'HIGH',
    audit: defaultAudit,
    extractedSocial: {}
  };

  if (!rawUrl || rawUrl.trim() === '' || rawUrl === 'NO_WEBSITE') {
    return emptyResult;
  }

  let targetUrl = rawUrl.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const isHttps = targetUrl.startsWith('https://');

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 LeadForgeAI/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: controller.signal,
      redirect: 'follow'
    });

    clearTimeout(timeoutId);
    const loadTimeMs = Date.now() - startTime;

    const statusCode = response.status;
    const finalUrl = response.url;

    if (statusCode >= 400) {
      return {
        status: 'BROKEN_WEBSITE',
        statusConfidence: 'HIGH',
        audit: {
          ...defaultAudit,
          hasWebsite: true,
          sslValid: isHttps,
          loadTimeMs,
          speedScore: 15
        },
        extractedSocial: {}
      };
    }

    const htmlText = await response.text();

    // Check for parked domain indicators
    const isParked = /domain for sale|buy this domain|godaddy parked|hugedomains|parked page|domain parking/i.test(htmlText);

    if (isParked) {
      return {
        status: 'PARKED_DOMAIN',
        statusConfidence: 'HIGH',
        audit: {
          ...defaultAudit,
          hasWebsite: true,
          sslValid: finalUrl.startsWith('https://'),
          loadTimeMs,
          speedScore: 20
        },
        extractedSocial: {}
      };
    }

    // Extract Social Links from HTML
    const extractedSocial: SocialLinks = {};

    const fbMatch = htmlText.match(/https?:\/\/(www\.)?facebook\.com\/([a-zA-Z0-9.\-_]+)/i);
    if (fbMatch) extractedSocial.facebook = fbMatch[0];

    const igMatch = htmlText.match(/https?:\/\/(www\.)?instagram\.com\/([a-zA-Z0-9.\-_]+)/i);
    if (igMatch) extractedSocial.instagram = igMatch[0];

    const liMatch = htmlText.match(/https?:\/\/(www\.)?linkedin\.com\/(company|in)\/([a-zA-Z0-9.\-_]+)/i);
    if (liMatch) extractedSocial.linkedin = liMatch[0];

    const waMatch = htmlText.match(/https?:\/\/(api|web)?\.?whatsapp\.com\/send\?phone=([0-9+]+)/i) || htmlText.match(/wa\.me\/([0-9+]+)/i);
    if (waMatch) extractedSocial.whatsapp = waMatch[0];

    // Detect tech stack & audit signals
    const hasMeta = /<meta\s/i.test(htmlText);
    const hasAnalytics = /gtag|google-analytics|ga\.js|googletagmanager/i.test(htmlText);
    const hasPixel = /connect\.facebook\.net|fbq\(/i.test(htmlText);
    const hasSchema = /application\/ld\+json|schema\.org/i.test(htmlText);
    const hasContact = /<form|contact|get in touch|send message/i.test(htmlText);
    const hasBooking = /calendly|acuityscheduling|mindbody|square|booking|schedule online|reserve/i.test(htmlText);

    let cmsDetected = 'Custom Web Build';
    if (/wp-content|wp-includes/i.test(htmlText)) cmsDetected = 'WordPress';
    else if (/wix\.com|wixsite/i.test(htmlText)) cmsDetected = 'Wix';
    else if (/squarespace/i.test(htmlText)) cmsDetected = 'Squarespace';
    else if (/shopify/i.test(htmlText)) cmsDetected = 'Shopify';

    const speedScore = Math.max(10, Math.min(100, Math.round(100 - (loadTimeMs / 60))));

    return {
      status: 'ACTIVE_WEBSITE',
      statusConfidence: 'HIGH',
      audit: {
        hasWebsite: true,
        sslValid: finalUrl.startsWith('https://'),
        speedScore,
        loadTimeMs,
        mobileFriendly: /viewport/i.test(htmlText),
        brokenLinksCount: 0,
        seoScore: (hasMeta ? 35 : 10) + (hasSchema ? 35 : 10) + (hasAnalytics ? 30 : 10),
        accessibilityScore: 70,
        hasMetaTags: hasMeta,
        hasAnalytics,
        hasFacebookPixel: hasPixel,
        hasSchemaOrg: hasSchema,
        cmsDetected,
        domainAgeYears: 5,
        isDomainExpired: false,
        hasContactForm: hasContact,
        hasOnlineBooking: hasBooking,
        hasLiveChat: /tawk|crisp|intercom|drift|zendesk|drift/i.test(htmlText)
      },
      extractedSocial
    };

  } catch (err: any) {
    // Timeout or Network Unreachable
    return {
      status: 'UNREACHABLE',
      statusConfidence: 'MEDIUM',
      audit: {
        ...defaultAudit,
        hasWebsite: true,
        sslValid: targetUrl.startsWith('https://'),
        loadTimeMs: 3500,
        speedScore: 10
      },
      extractedSocial: {}
    };
  }
}
