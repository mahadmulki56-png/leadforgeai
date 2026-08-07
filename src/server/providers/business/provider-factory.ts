import { BusinessDataProvider } from './business-data-provider';
import { GooglePlacesProvider } from './google-provider';
import { OpenStreetMapProvider } from './openstreetmap-provider';

export class ProviderFactory {
  static getProvider(): BusinessDataProvider {
    const configuredProvider = (process.env.BUSINESS_DATA_PROVIDER || '').toLowerCase();
    const hasGoogleKey = Boolean(process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY);

    if (configuredProvider === 'google' || (configuredProvider === '' && hasGoogleKey)) {
      return new GooglePlacesProvider();
    }

    if (configuredProvider === 'openstreetmap' || configuredProvider === 'osm' || !hasGoogleKey) {
      return new OpenStreetMapProvider();
    }

    return new OpenStreetMapProvider();
  }
}
