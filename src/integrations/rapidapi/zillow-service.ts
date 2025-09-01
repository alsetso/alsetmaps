import { ZillowSearchResult } from '@/features/property-management/types/pin';

const RAPIDAPI_HOST = 'zillow56.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;

export class ZillowService {
  private static async makeRequest(endpoint: string, params: Record<string, string>): Promise<any> {
    if (!RAPIDAPI_KEY) {
      throw new Error('RapidAPI key not found. Please add NEXT_PUBLIC_RAPIDAPI_KEY to your .env.local file');
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `https://${RAPIDAPI_HOST}${endpoint}?${queryString}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': RAPIDAPI_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Zillow API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Zillow API request failed:', error);
      throw error;
    }
  }

  static async searchByAddress(address: string): Promise<ZillowSearchResult> {
    try {
      const data = await this.makeRequest('/search_address', { address });
      
      // Parse the raw Zillow response and extract relevant data
      const result: ZillowSearchResult = {
        address: address,
        raw_data: data,
      };

      // Extract common property fields from the raw response
      if (data && typeof data === 'object') {
        // These field names may vary based on the actual Zillow API response
        // Adjust them based on the actual response structure
        if (data.price) result.price = data.price;
        if (data.bedrooms) result.bedrooms = data.bedrooms;
        if (data.bathrooms) result.bathrooms = data.bathrooms;
        if (data.square_feet) result.square_feet = data.square_feet;
        if (data.lot_size) result.lot_size = data.lot_size;
        if (data.year_built) result.year_built = data.year_built;
        if (data.property_type) result.property_type = data.property_type;
        if (data.listing_status) result.listing_status = data.listing_status;
        if (data.last_sold_date) result.last_sold_date = data.last_sold_date;
        if (data.last_sold_price) result.last_sold_price = data.last_sold_price;
        if (data.zestimate) result.zestimate = data.zestimate;
        if (data.rent_zestimate) result.rent_zestimate = data.rent_zestimate;
      }

      return result;
    } catch (error) {
      console.error('Failed to search Zillow by address:', error);
      // Return a basic result with just the address if the API fails
      return {
        address: address,
        raw_data: null,
      };
    }
  }
}
