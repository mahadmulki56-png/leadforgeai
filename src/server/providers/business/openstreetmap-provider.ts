import { BusinessDataProvider } from './business-data-provider';
import { SearchParams, RawProviderBusiness } from '../../types/business';

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export class OpenStreetMapProvider implements BusinessDataProvider {
  readonly providerName = 'OpenStreetMap & Overpass (Official Open Data)';

  async searchBusinesses(params: SearchParams): Promise<RawProviderBusiness[]> {
    const city = params.city.trim();
    const state = params.state.trim();
    const country = params.country || 'USA';

    // Step 1: Geocode city/state location via Nominatim to get lat-lng center
    let lat: number | null = null;
    let lon: number | null = null;

    try {
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}&format=json&limit=1`;
      const geocodeRes = await fetchWithTimeout(geocodeUrl, {
        headers: {
          'User-Agent': 'LeadForgeAI-RealDataEngine/1.0 (contact@leadforge.ai)'
        }
      }, 5000);

      if (geocodeRes.ok) {
        const geocodeData = await geocodeRes.json();
        if (geocodeData && geocodeData.length > 0) {
          lat = parseFloat(geocodeData[0].lat);
          lon = parseFloat(geocodeData[0].lon);
        }
      }
    } catch (e) {
      console.warn('Geocoding lookup timed out or failed, proceeding to direct Nominatim search fallback');
    }

    if (lat === null || lon === null) {
      return this.searchNominatimFallback(params, city, state);
    }

    const radiusMeters = Math.min((params.radiusKm || 25) * 1000, 30000); // max 30km radius for performance

    // Step 2: Construct Overpass query with proper OR union syntax to avoid heavy DB scans
    const unionStatements = this.getOverpassStatements(params.industry, radiusMeters, lat, lon);

    const overpassQuery = `
      [out:json][timeout:8];
      (
        ${unionStatements}
      );
      out center 40;
    `;

    // Step 3: Try Overpass mirror endpoints with fast timeouts
    let overpassData: any = null;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const res = await fetchWithTimeout(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'LeadForgeAI-RealDataEngine/1.0 (contact@leadforge.ai)'
          },
          body: `data=${encodeURIComponent(overpassQuery)}`
        }, 6000);

        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.elements)) {
            overpassData = json;
            break; // Successfully got response
          }
        }
      } catch (e) {
        // Continue to next mirror endpoint
      }
    }

    if (!overpassData || !overpassData.elements || overpassData.elements.length === 0) {
      // Fallback seamlessly to direct Nominatim query if Overpass mirrors failed or returned 0 items
      return this.searchNominatimFallback(params, city, state);
    }

    const elements = overpassData.elements;
    const businesses: RawProviderBusiness[] = [];

    for (const el of elements) {
      const tags = el.tags || {};
      const name = tags.name;
      if (!name) continue;

      const elementLat = el.lat || el.center?.lat || lat;
      const elementLon = el.lon || el.center?.lon || lon;

      const street = tags['addr:street'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() : '';
      const address = street ? `${street}, ${city}, ${state} ${tags['addr:postcode'] || ''}` : `${city}, ${state}`;

      const phone = tags.phone || tags['contact:phone'] || tags['phone:mobile'] || undefined;
      const website = tags.website || tags['contact:website'] || tags['url'] || undefined;

      const refPlaceId = tags['ref:google_place'] || tags['google_place_id'] || tags['place_id:google'] || null;
      const hasVerifiedPlace = Boolean(refPlaceId);

      businesses.push({
        provider: 'OpenStreetMap',
        providerBusinessId: `osm-${el.type}-${el.id}`,
        name,
        category: tags.amenity || tags.shop || tags.office || tags.healthcare || params.industry,
        categories: [tags.amenity, tags.shop, tags.office, tags.healthcare].filter(Boolean),
        address,
        street,
        city: tags['addr:city'] || city,
        state: tags['addr:state'] || state,
        postalCode: tags['addr:postcode'],
        country: country,
        latitude: elementLat,
        longitude: elementLon,
        phone,
        website,
        rating: tags.rating ? parseFloat(tags.rating) : undefined,
        reviewCount: tags.reviews ? parseInt(tags.reviews, 10) : undefined,
        googlePlaceId: refPlaceId,
        googleMapsUrl: hasVerifiedPlace ? `https://www.google.com/maps/place/?q=place_id:${refPlaceId}` : null,
        googleMapsVerified: hasVerifiedPlace,
        googleMapsLastVerifiedAt: hasVerifiedPlace ? new Date().toISOString() : null,
        googleMapsSource: hasVerifiedPlace ? 'openstreetmap_ref' : null,
      });
    }

    if (businesses.length === 0) {
      return this.searchNominatimFallback(params, city, state);
    }

    return businesses;
  }

  private async searchNominatimFallback(params: SearchParams, city: string, state: string): Promise<RawProviderBusiness[]> {
    try {
      const q = `${params.industry} in ${city}, ${state}`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&extratags=1&limit=30`;

      const res = await fetchWithTimeout(url, {
        headers: {
          'User-Agent': 'LeadForgeAI-RealDataEngine/1.0 (contact@leadforge.ai)'
        }
      }, 7000);

      if (!res.ok) return [];

      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any) => {
        const addr = item.address || {};
        const extra = item.extratags || {};
        const name = item.display_name.split(',')[0] || item.name || 'Local Business';

        return {
          provider: 'OpenStreetMap Nominatim',
          providerBusinessId: `nominatim-${item.osm_type}-${item.osm_id}`,
          name,
          category: item.type || item.class || params.industry,
          categories: [item.class, item.type].filter(Boolean),
          address: item.display_name || '',
          city: addr.city || addr.town || addr.village || city,
          state: addr.state || state,
          postalCode: addr.postcode,
          country: addr.country || 'USA',
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          phone: extra.phone || extra['contact:phone'],
          website: extra.website || extra['contact:website'] || extra.url,
          googlePlaceId: extra['ref:google_place'] || extra['google_place_id'] || null,
          googleMapsUrl: extra['ref:google_place'] ? `https://www.google.com/maps/place/?q=place_id:${extra['ref:google_place']}` : null,
          googleMapsVerified: Boolean(extra['ref:google_place']),
          googleMapsLastVerifiedAt: extra['ref:google_place'] ? new Date().toISOString() : null,
          googleMapsSource: extra['ref:google_place'] ? 'nominatim_ref' : null,
        };
      });
    } catch (err) {
      return [];
    }
  }

  async getBusinessDetails(providerBusinessId: string): Promise<RawProviderBusiness | null> {
    return null;
  }

  private getOverpassStatements(industry: string, radiusMeters: number, lat: number, lon: number): string {
    const ind = industry.toLowerCase();
    const selectors: string[] = [];

    if (ind.includes('dent') || ind.includes('health') || ind.includes('doctor') || ind.includes('clinic')) {
      selectors.push('["amenity"~"dentist|clinic|doctors|pharmacy|hospital"]');
      selectors.push('["healthcare"]');
    } else if (ind.includes('plumb') || ind.includes('hvac') || ind.includes('electr') || ind.includes('roof') || ind.includes('contract')) {
      selectors.push('["craft"~"plumber|electrician|hvac|roofing|builder|carpenter"]');
    } else if (ind.includes('legal') || ind.includes('law') || ind.includes('attorney')) {
      selectors.push('["office"~"lawyer|legal"]');
    } else if (ind.includes('real estate') || ind.includes('realtor') || ind.includes('property')) {
      selectors.push('["office"~"estate_agent|property_management"]');
    } else if (ind.includes('auto') || ind.includes('car') || ind.includes('repair') || ind.includes('mechanic')) {
      selectors.push('["shop"~"car_repair|car|car_parts"]');
    } else if (ind.includes('fit') || ind.includes('gym') || ind.includes('spa') || ind.includes('salon')) {
      selectors.push('["leisure"="fitness_centre"]');
      selectors.push('["shop"~"beauty|hairdresser|spa"]');
    } else if (ind.includes('restaurant') || ind.includes('food') || ind.includes('cafe') || ind.includes('bakery')) {
      selectors.push('["amenity"~"restaurant|cafe|fast_food|bakery"]');
    } else {
      selectors.push('["amenity"]');
      selectors.push('["shop"]');
      selectors.push('["office"]');
    }

    const statements: string[] = [];
    for (const sel of selectors) {
      statements.push(`node["name"]${sel}(around:${radiusMeters},${lat},${lon});`);
      statements.push(`way["name"]${sel}(around:${radiusMeters},${lat},${lon});`);
    }

    return statements.join('\n');
  }
}

