import { BusinessDataProvider } from './business-data-provider';
import { SearchParams, RawProviderBusiness } from '../../types/business';

export class GooglePlacesProvider implements BusinessDataProvider {
  readonly providerName = 'Google Places API (Official)';

  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY || '';
  }

  async searchBusinesses(params: SearchParams): Promise<RawProviderBusiness[]> {
    if (!this.apiKey) {
      throw new Error('Google Places API key is missing. Set GOOGLE_MAPS_API_KEY in environment variables.');
    }

    const queryLocation = [params.city, params.state, params.country || 'United States'].filter(Boolean).join(', ');
    const queryText = `${params.industry} in ${queryLocation}`;

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(queryText)}&key=${this.apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Places API HTTP error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn(`Google Places API returned status: ${data.status} - ${data.error_message || ''}`);
      if (data.status === 'OVER_QUERY_LIMIT' || data.status === 'REQUEST_DENIED') {
        throw new Error(`Google Places API Error: ${data.status} - ${data.error_message || 'Quota exceeded or invalid key'}`);
      }
    }

    const results = data.results || [];
    const businesses: RawProviderBusiness[] = [];

    // Fetch details for top matching places (up to 12)
    const topPlaces = results.slice(0, 15);

    for (const place of topPlaces) {
      try {
        const details = await this.getPlaceDetails(place.place_id);
        const merged = details || this.mapBasicPlace(place, params.city, params.state);
        businesses.push(merged);
      } catch (e) {
        businesses.push(this.mapBasicPlace(place, params.city, params.state));
      }
    }

    return businesses;
  }

  async getBusinessDetails(providerBusinessId: string): Promise<RawProviderBusiness | null> {
    return this.getPlaceDetails(providerBusinessId);
  }

  private async getPlaceDetails(placeId: string): Promise<RawProviderBusiness | null> {
    if (!this.apiKey) return null;

    const fields = 'place_id,name,formatted_address,address_components,geometry,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,opening_hours,url,types';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 'OK' || !data.result) return null;

    const r = data.result;
    const components = r.address_components || [];

    const getComp = (type: string) => components.find((c: any) => c.types.includes(type))?.long_name || '';

    const streetNum = getComp('street_number');
    const route = getComp('route');
    const street = [streetNum, route].filter(Boolean).join(' ');
    const city = getComp('locality') || getComp('sublocality') || getComp('postal_town');
    const state = getComp('administrative_area_level_1') || getComp('administrative_area_level_2');
    const postalCode = getComp('postal_code');
    const country = getComp('country');

    return {
      provider: 'Google Places API',
      providerBusinessId: r.place_id,
      name: r.name || 'Unknown Business',
      category: (r.types && r.types[0]) ? r.types[0].replace(/_/g, ' ') : 'Local Business',
      categories: r.types || [],
      address: r.formatted_address || '',
      street,
      city,
      state,
      postalCode,
      country,
      latitude: r.geometry?.location?.lat || 0,
      longitude: r.geometry?.location?.lng || 0,
      phone: r.formatted_phone_number || r.international_phone_number,
      website: r.website,
      rating: r.rating,
      reviewCount: r.user_ratings_total,
      googlePlaceId: r.place_id,
      googleMapsUrl: r.url || `https://www.google.com/maps/place/?q=place_id:${r.place_id}`,
      googleMapsVerified: true,
      googleMapsLastVerifiedAt: new Date().toISOString(),
      googleMapsSource: 'google_places_api',
      openNow: r.opening_hours?.open_now,
      placeTypes: r.types
    };
  }

  private mapBasicPlace(place: any, fallbackCity: string, fallbackState: string): RawProviderBusiness {
    return {
      provider: 'Google Places API',
      providerBusinessId: place.place_id,
      name: place.name || 'Unknown Business',
      category: (place.types && place.types[0]) ? place.types[0].replace(/_/g, ' ') : 'Local Business',
      categories: place.types || [],
      address: place.formatted_address || '',
      city: fallbackCity,
      state: fallbackState,
      country: 'United States',
      latitude: place.geometry?.location?.lat || 0,
      longitude: place.geometry?.location?.lng || 0,
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      googlePlaceId: place.place_id,
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
      googleMapsVerified: true,
      googleMapsLastVerifiedAt: new Date().toISOString(),
      googleMapsSource: 'google_places_api',
      openNow: place.opening_hours?.open_now
    };
  }
}
