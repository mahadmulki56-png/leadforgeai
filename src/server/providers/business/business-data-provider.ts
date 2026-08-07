import { SearchParams, RawProviderBusiness } from '../../types/business';

export interface BusinessDataProvider {
  readonly providerName: string;
  searchBusinesses(params: SearchParams): Promise<RawProviderBusiness[]>;
  getBusinessDetails(providerBusinessId: string): Promise<RawProviderBusiness | null>;
}
