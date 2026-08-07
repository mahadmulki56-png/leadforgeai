import { BusinessLead, WebsiteAudit, SocialLinks } from '../../types';
import { WebsiteStatus } from '../types/business';

export interface ScoreResult {
  opportunityScore: number;
  websiteQualityScore: number;
  leadScore: number;
  reasons: string[];
  recommendedServices: string[];
  dealValue: number;
}

export function calculateLeadScore(
  websiteStatus: WebsiteStatus,
  audit: WebsiteAudit,
  rating?: number,
  reviewCount?: number,
  social?: SocialLinks
): ScoreResult {
  let score = 0;
  const reasons: string[] = [];
  const recommendedServices: string[] = [];

  // 1. Website Status Scoring
  if (websiteStatus === 'NO_WEBSITE') {
    score += 40;
    reasons.push('CRITICAL: No official website detected (+40)');
    recommendedServices.push('Turnkey Custom Mobile-Responsive Website ($2,800)');
  } else if (websiteStatus === 'BROKEN_WEBSITE' || websiteStatus === 'PARKED_DOMAIN' || websiteStatus === 'UNREACHABLE') {
    score += 30;
    reasons.push(`CRITICAL: Business website is ${websiteStatus.replace(/_/g, ' ')} (+30)`);
    recommendedServices.push('Domain Recovery & High-Speed Redesign ($2,200)');
  } else {
    // Active website audits
    if (!audit.sslValid) {
      score += 25;
      reasons.push('CRITICAL: Insecure HTTP connection (Missing SSL Certificate) (+25)');
      recommendedServices.push('SSL Security & HTTPS Certificate Install ($250)');
    }
    if (audit.speedScore < 50) {
      score += 15;
      reasons.push(`Slow mobile loading speed (${audit.speedScore}/100 PageSpeed) (+15)`);
      recommendedServices.push('PageSpeed & Core Web Vitals Optimization ($750)');
    }
    if (!audit.mobileFriendly) {
      score += 15;
      reasons.push('Not optimized for mobile smartphones (+15)');
      recommendedServices.push('Mobile UX & Responsive Interface Refresh ($1,200)');
    }
    if (!audit.hasOnlineBooking) {
      score += 10;
      reasons.push('Lacks automated 24/7 online consultation booking (+10)');
      recommendedServices.push('Automated Client Booking & Scheduling Funnel ($950)');
    }
  }

  // 2. Google Reputation & Traffic Potential
  const revs = reviewCount || 0;
  const rat = rating || 0;

  if (revs >= 100) {
    score += 15;
    reasons.push(`High local reputation volume (${revs} Google Reviews) (+15)`);
  } else if (revs >= 25) {
    score += 8;
    reasons.push(`Established local reviews (${revs} reviews) (+8)`);
  }

  if (rat >= 4.5) {
    score += 10;
    reasons.push(`High customer satisfaction (${rat} ★ rating) (+10)`);
  }

  // 3. Social Media Presence
  const hasFb = Boolean(social?.facebook);
  const hasIg = Boolean(social?.instagram);
  if (!hasFb && !hasIg) {
    score += 10;
    reasons.push('Missing active Facebook or Instagram profiles (+10)');
    recommendedServices.push('Local Social Media Setup & Retargeting Setup ($600)');
  }

  // Cap score at 100
  const opportunityScore = Math.min(100, Math.max(10, score));

  // Calculate website quality score (inverse of opportunity for fixing)
  let websiteQualityScore = 0;
  if (websiteStatus === 'ACTIVE_WEBSITE') {
    websiteQualityScore = Math.round((audit.speedScore + audit.seoScore + (audit.sslValid ? 30 : 0)) / 2);
    websiteQualityScore = Math.min(100, Math.max(15, websiteQualityScore));
  } else {
    websiteQualityScore = 10;
  }

  // Calculate overall Lead Score
  const leadScore = Math.min(100, Math.round((opportunityScore * 0.7) + (revs > 50 ? 20 : 10) + (rat >= 4.5 ? 10 : 0)));

  // Calculate Est Deal Value
  let dealValue = 2500;
  if (websiteStatus === 'NO_WEBSITE') dealValue = 3800;
  else if (revs > 100) dealValue = 4800;
  else if (!audit.sslValid) dealValue = 3200;

  return {
    opportunityScore,
    websiteQualityScore,
    leadScore,
    reasons,
    recommendedServices,
    dealValue
  };
}
