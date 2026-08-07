import { RawProviderBusiness } from '../types/business';

/**
 * Calculates Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  for (let i = 0; i <= lenA; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= lenB; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[lenA][lenB];
}

/**
 * Calculates string similarity between 0.0 and 1.0 combining Levenshtein and Token overlap
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 1.0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  const distance = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  const levenshteinScore = maxLen === 0 ? 1 : 1 - distance / maxLen;

  // Token set similarity (Dice coefficient on word tokens)
  const tokens1 = new Set(s1.split(/\s+/).filter(Boolean));
  const tokens2 = new Set(s2.split(/\s+/).filter(Boolean));

  let intersection = 0;
  tokens1.forEach(t => {
    if (tokens2.has(t)) intersection++;
  });

  const tokenScore = (tokens1.size + tokens2.size) === 0 ? 0 : (2 * intersection) / (tokens1.size + tokens2.size);

  return 0.5 * levenshteinScore + 0.5 * tokenScore;
}

/**
 * Normalizes business names by removing legal suffixes and special characters
 */
export function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(llc|inc|corp|corporation|co|company|ltd|limited|services|group|pllc|pa|p\.a\.|p\.c\.)\b/gi, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes physical street addresses by standardizing common road abbreviations
 */
export function normalizeAddress(address: string): string {
  if (!address) return '';
  return address
    .toLowerCase()
    .replace(/\b(street)\b/g, 'st')
    .replace(/\b(avenue)\b/g, 'ave')
    .replace(/\b(boulevard)\b/g, 'blvd')
    .replace(/\b(road)\b/g, 'rd')
    .replace(/\b(drive)\b/g, 'dr')
    .replace(/\b(lane)\b/g, 'ln')
    .replace(/\b(suite|ste|unit|apt| #)\b/g, '#')
    .replace(/[^a-z0-9\s#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface BusinessDeduplicationItem {
  id?: string;
  provider?: string;
  providerBusinessId?: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  website?: string;
  [key: string]: any;
}

/**
 * Checks if two business entries are fuzzy duplicates based on name, address, and city/state similarity
 */
export function areFuzzyDuplicates(item1: BusinessDeduplicationItem, item2: BusinessDeduplicationItem): boolean {
  // Normalize names and addresses
  const name1 = normalizeName(item1.name);
  const name2 = normalizeName(item2.name);

  if (!name1 || !name2) return false;

  const nameSim = calculateSimilarity(name1, name2);

  const addr1 = normalizeAddress(item1.address || '');
  const addr2 = normalizeAddress(item2.address || '');

  const city1 = (item1.city || '').toLowerCase().trim();
  const city2 = (item2.city || '').toLowerCase().trim();

  const sameCity = Boolean(city1 && city2 && city1 === city2);

  if (addr1 && addr2) {
    const addrSim = calculateSimilarity(addr1, addr2);
    // High name similarity + moderate address similarity -> duplicate
    if (nameSim >= 0.82 && addrSim >= 0.65) return true;
    // Moderate name similarity + high address similarity -> duplicate
    if (nameSim >= 0.70 && addrSim >= 0.85) return true;
  }

  // Same city + very high name similarity -> duplicate
  if (sameCity && nameSim >= 0.85) return true;

  // Extremely high name similarity overall (e.g. >= 0.95)
  if (nameSim >= 0.95 && sameCity) return true;

  return false;
}

/**
 * Main deduplicateResults utility function filtering duplicate business entries using exact and fuzzy matching
 */
export function deduplicateResults<T extends BusinessDeduplicationItem>(businesses: T[]): {
  deduplicated: T[];
  removedCount: number;
} {
  const deduplicated: T[] = [];
  let removedCount = 0;

  const seenIds = new Set<string>();
  const seenPhones = new Set<string>();
  const seenDomains = new Set<string>();

  for (const item of businesses) {
    // 1. Check Provider ID if present
    if (item.provider && item.providerBusinessId) {
      const providerKey = `${item.provider}:${item.providerBusinessId}`;
      if (seenIds.has(providerKey)) {
        removedCount++;
        continue;
      }
    }

    // 2. Check Normalized Phone Number
    const normalizedPhone = item.phone ? item.phone.replace(/[^0-9]/g, '') : '';
    if (normalizedPhone && normalizedPhone.length >= 7) {
      if (seenPhones.has(normalizedPhone)) {
        removedCount++;
        continue;
      }
    }

    // 3. Check Normalized Domain
    let normalizedDomain = '';
    if (item.website) {
      try {
        const u = new URL(item.website.startsWith('http') ? item.website : `https://${item.website}`);
        normalizedDomain = u.hostname.replace(/^www\./, '').toLowerCase();
      } catch (e) {
        normalizedDomain = '';
      }
    }

    if (normalizedDomain && normalizedDomain !== 'facebook.com' && normalizedDomain !== 'instagram.com') {
      if (seenDomains.has(normalizedDomain)) {
        removedCount++;
        continue;
      }
    }

    // 4. Fuzzy Matching against already accepted items
    let isFuzzyDup = false;
    for (const existing of deduplicated) {
      if (areFuzzyDuplicates(item, existing)) {
        isFuzzyDup = true;
        break;
      }
    }

    if (isFuzzyDup) {
      removedCount++;
      continue;
    }

    // Mark exact identifiers as seen
    if (item.provider && item.providerBusinessId) {
      seenIds.add(`${item.provider}:${item.providerBusinessId}`);
    }
    if (normalizedPhone && normalizedPhone.length >= 7) {
      seenPhones.add(normalizedPhone);
    }
    if (normalizedDomain && normalizedDomain !== 'facebook.com' && normalizedDomain !== 'instagram.com') {
      seenDomains.add(normalizedDomain);
    }

    deduplicated.push(item);
  }

  return { deduplicated, removedCount };
}

/**
 * Alias for backward compatibility with RawProviderBusiness[]
 */
export function deduplicateBusinesses(rawBusinesses: RawProviderBusiness[]): {
  deduplicated: RawProviderBusiness[];
  removedCount: number;
} {
  return deduplicateResults(rawBusinesses);
}

