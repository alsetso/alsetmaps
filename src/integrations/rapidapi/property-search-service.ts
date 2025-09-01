import { SearchHistoryCreate } from '@/features/property-management/types/search-history';

export interface PropertySearchResult {
  success: boolean;
  data?: any;
  error?: string;
  searchHistoryId?: string;
}

export interface RapidAPISearchParams {
  address: string;
  latitude?: number;
  longitude?: number;
  searchRadius?: number; // in miles
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
}

export class PropertySearchService {
  private static readonly RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  private static readonly RAPIDAPI_HOST = 'zillow-com1.p.rapidapi.com';

  /**
   * Perform a smart property search using RapidAPI
   * This consumes 1 credit and provides comprehensive property data
   */
  static async performSmartSearch(
    searchParams: RapidAPISearchParams,
    searchHistoryData: Omit<SearchHistoryCreate, 'rapid_api_data'>
  ): Promise<PropertySearchResult> {
    if (!this.RAPIDAPI_KEY) {
      return {
        success: false,
        error: 'RapidAPI key not configured'
      };
    }

    try {
      // First, record the search attempt
      const searchHistoryId = await this.recordSearchAttempt(searchHistoryData);

      // Perform the RapidAPI search
      const searchResult = await this.searchProperties(searchParams);

      if (searchResult.success && searchHistoryId) {
        // Update search history with RapidAPI data
        await this.updateSearchWithRapidAPIData(searchHistoryId, searchResult.data);
      }

      return {
        success: searchResult.success,
        data: searchResult.data,
        error: searchResult.error,
        searchHistoryId
      };
    } catch (error) {
      console.error('Smart search failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Search properties using RapidAPI Zillow endpoint
   */
  private static async searchProperties(searchParams: RapidAPISearchParams): Promise<PropertySearchResult> {
    try {
      const url = new URL('https://zillow-com1.p.rapidapi.com/propertyExtendedSearch');
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('location', searchParams.address);
      
      if (searchParams.latitude && searchParams.longitude) {
        params.append('latitude', searchParams.latitude.toString());
        params.append('longitude', searchParams.longitude.toString());
      }
      
      if (searchParams.searchRadius) {
        params.append('radius', searchParams.searchRadius.toString());
      }
      
      if (searchParams.propertyType) {
        params.append('propertyType', searchParams.propertyType);
      }
      
      if (searchParams.minPrice) {
        params.append('minPrice', searchParams.minPrice.toString());
      }
      
      if (searchParams.maxPrice) {
        params.append('maxPrice', searchParams.maxPrice.toString());
      }
      
      if (searchParams.minBeds) {
        params.append('minBeds', searchParams.minBeds.toString());
      }
      
      if (searchParams.maxBeds) {
        params.append('maxBeds', searchParams.maxBeds.toString());
      }
      
      if (searchParams.minBaths) {
        params.append('minBaths', searchParams.minBaths.toString());
      }
      
      if (searchParams.maxBaths) {
        params.append('maxBaths', searchParams.maxBaths.toString());
      }

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': this.RAPIDAPI_HOST,
        },
      });

      if (!response.ok) {
        throw new Error(`RapidAPI request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Process and format the response data
      const processedData = this.processPropertyData(data);
      
      return {
        success: true,
        data: processedData
      };
    } catch (error) {
      console.error('RapidAPI search failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'RapidAPI search failed'
      };
    }
  }

  /**
   * Process and format property data from RapidAPI
   */
  private static processPropertyData(rawData: any): any {
    try {
      // Extract relevant property information
      const properties = rawData.results || [];
      
      return {
        totalResults: rawData.totalResultCount || 0,
        properties: properties.map((prop: any) => ({
          id: prop.zpid,
          address: prop.streetAddress,
          city: prop.city,
          state: prop.state,
          zipCode: prop.zipcode,
          price: prop.price,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          squareFootage: prop.livingArea,
          propertyType: prop.homeType,
          lotSize: prop.lotSize,
          yearBuilt: prop.yearBuilt,
          lastSoldDate: prop.lastSoldDate,
          lastSoldPrice: prop.lastSoldPrice,
          zestimate: prop.zestimate,
          rentZestimate: prop.rentZestimate,
          imageUrl: prop.imgSrc,
          latitude: prop.latitude,
          longitude: prop.longitude,
          url: prop.url
        })),
        searchMetadata: {
          searchTimestamp: new Date().toISOString(),
          apiProvider: 'RapidAPI Zillow',
          dataSource: 'Zillow'
        }
      };
    } catch (error) {
      console.error('Error processing property data:', error);
      return rawData; // Return raw data if processing fails
    }
  }

  /**
   * Record the search attempt in search history
   */
  private static async recordSearchAttempt(
    searchData: Omit<SearchHistoryCreate, 'rapid_api_data'>
  ): Promise<string | null> {
    try {
      // This would typically be done through your search history service
      // For now, we'll return a placeholder
      console.log('Recording search attempt:', searchData);
      return 'placeholder-id';
    } catch (error) {
      console.error('Failed to record search attempt:', error);
      return null;
    }
  }

  /**
   * Update search history with RapidAPI data
   */
  private static async updateSearchWithRapidAPIData(
    searchHistoryId: string,
    rapidAPIData: any
  ): Promise<void> {
    try {
      // This would typically be done through your search history service
      console.log('Updating search history with RapidAPI data:', {
        searchHistoryId,
        rapidAPIData
      });
    } catch (error) {
      console.error('Failed to update search history with RapidAPI data:', error);
    }
  }

  /**
   * Get property details for a specific property ID
   */
  static async getPropertyDetails(propertyId: string): Promise<PropertySearchResult> {
    if (!this.RAPIDAPI_KEY) {
      return {
        success: false,
        error: 'RapidAPI key not configured'
      };
    }

    try {
      const response = await fetch(`https://zillow-com1.p.rapidapi.com/property`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': this.RAPIDAPI_HOST,
        },
        body: JSON.stringify({
          propertyId: propertyId
        })
      });

      if (!response.ok) {
        throw new Error(`RapidAPI request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Failed to get property details:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get property details'
      };
    }
  }

  /**
   * Get market trends for a specific area
   */
  static async getMarketTrends(
    address: string,
    latitude?: number,
    longitude?: number
  ): Promise<PropertySearchResult> {
    if (!this.RAPIDAPI_KEY) {
      return {
        success: false,
        error: 'RapidAPI key not configured'
      };
    }

    try {
      const params = new URLSearchParams();
      params.append('location', address);
      
      if (latitude && longitude) {
        params.append('latitude', latitude.toString());
        params.append('longitude', longitude.toString());
      }

      const response = await fetch(`https://zillow-com1.p.rapidapi.com/marketTrends?${params.toString()}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': this.RAPIDAPI_HOST,
        },
      });

      if (!response.ok) {
        throw new Error(`RapidAPI request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error('Failed to get market trends:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get market trends'
      };
    }
  }
}
