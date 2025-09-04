import { PropertySearchService } from './property-search-service';

export interface BasicSearchSuggestion {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  context: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

export interface BasicSearchResult {
  success: boolean;
  data?: {
    address: string;
    latitude: number;
    longitude: number;
    searchHistoryId?: string;
  };
  error?: string;
}

export class BasicSearchService {
  private static readonly MAPBOX_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  private static readonly MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  /**
   * Perform geocoding for basic search (full address)
   */
  static async geocodeAddress(query: string): Promise<BasicSearchSuggestion[]> {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.MAPBOX_API_URL}/${encodeURIComponent(query)}.json?access_token=${this.MAPBOX_TOKEN}&types=address&limit=5&country=US`
      );

      if (response.ok) {
        const data = await response.json();
        return data.features || [];
      }
      
      throw new Error(`Mapbox API error: ${response.status}`);
    } catch (error) {
      console.error('Basic search geocoding error:', error);
      return [];
    }
  }

  /**
   * Perform basic property search
   */
  static async performSearch(address: string, coordinates: [number, number]): Promise<BasicSearchResult> {
    try {
      const searchRequest = {
        address,
        searchType: 'basic' as const,
        latitude: coordinates[1],
        longitude: coordinates[0]
      };

      const result = await PropertySearchService.performSearch(searchRequest);
      
      if (result.success) {
        return {
          success: true,
          data: {
            address: result.data?.address || address,
            latitude: result.data?.latitude || coordinates[1],
            longitude: result.data?.longitude || coordinates[0],
            searchHistoryId: result.data?.searchHistoryId
          }
        };
      }

      return {
        success: false,
        error: result.error || 'Basic search failed'
      };
    } catch (error) {
      console.error('Basic search service error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during basic search'
      };
    }
  }

  /**
   * Validate basic search input
   */
  static validateInput(address: string): { isValid: boolean; error?: string } {
    if (!address.trim()) {
      return { isValid: false, error: 'Address is required' };
    }
    
    if (address.trim().length < 5) {
      return { isValid: false, error: 'Address must be at least 5 characters' };
    }

    return { isValid: true };
  }

  /**
   * Get search suggestions with enhanced metadata
   */
  static enhanceSuggestions(suggestions: BasicSearchSuggestion[]): BasicSearchSuggestion[] {
    return suggestions.map(suggestion => ({
      ...suggestion,
      // Add any basic search specific enhancements here
    }));
  }
}
