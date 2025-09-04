import { PropertySearchService } from './property-search-service';
import { MapboxGeocodingService } from '@/integrations/mapbox/geocoding-service';

export interface SmartSearchSuggestion {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
  context: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
  confidence?: number;
  relevance?: number;
}

export interface SmartSearchAddress {
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface SmartSearchResult {
  success: boolean;
  data?: {
    address: string;
    latitude: number;
    longitude: number;
    searchHistoryId?: string;
    enhancedData?: any;
  };
  error?: string;
}

export interface SmartSearchValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldStatus: {
    houseNumber: 'valid' | 'invalid' | 'warning';
    street: 'valid' | 'invalid' | 'warning';
    city: 'valid' | 'invalid' | 'warning';
    state: 'valid' | 'invalid' | 'warning';
    zipCode: 'valid' | 'invalid' | 'warning';
  };
}

export class SmartSearchService {
  private static readonly MAPBOX_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  private static readonly MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  /**
   * Perform context-aware geocoding for smart search
   */
  static async geocodeWithContext(
    query: string, 
    field: keyof SmartSearchAddress, 
    existingFields: Partial<SmartSearchAddress>
  ): Promise<SmartSearchSuggestion[]> {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    try {
      // Build context-aware query using all filled fields
      let contextQuery = query;
      
      if (field !== 'houseNumber' && existingFields.houseNumber?.trim()) {
        contextQuery = `${existingFields.houseNumber} ${contextQuery}`;
      }
      if (field !== 'street' && existingFields.street?.trim()) {
        contextQuery = `${contextQuery} ${existingFields.street}`;
      }
      if (field !== 'city' && existingFields.city?.trim()) {
        contextQuery = `${contextQuery}, ${existingFields.city}`;
      }
      if (field !== 'state' && existingFields.state?.trim()) {
        contextQuery = `${contextQuery}, ${existingFields.state}`;
      }
      if (field !== 'zipCode' && existingFields.zipCode?.trim()) {
        contextQuery = `${contextQuery} ${existingFields.zipCode}`;
      }

      console.log('🔍 Smart search geocoding with context:', { field, query, contextQuery });

      const response = await fetch(
        `${this.MAPBOX_API_URL}/${encodeURIComponent(contextQuery)}.json?access_token=${this.MAPBOX_TOKEN}&types=address&limit=5&country=US`
      );

      if (response.ok) {
        const data = await response.json();
        return this.enhanceSmartSuggestions(data.features || []);
      }
      
      throw new Error(`Mapbox API error: ${response.status}`);
    } catch (error) {
      console.error('Smart search geocoding error:', error);
      return [];
    }
  }

  /**
   * Parse address suggestion into individual fields
   */
  static async parseAddressSuggestion(suggestion: SmartSearchSuggestion): Promise<SmartSearchAddress> {
    try {
      // Use the geocodeAddress method to get properly parsed components
      const geocodedAddress = await MapboxGeocodingService.geocodeAddress(suggestion.place_name);
      
      if (geocodedAddress) {
        console.log('Geocoded address components:', geocodedAddress);
        
        // Parse the full address to extract components properly
        const parsedComponents = MapboxGeocodingService.extractAddressComponents(geocodedAddress.fullAddress);
        console.log('Parsed components from full address:', parsedComponents);
        
        // Extract house number from the parsed address
        const houseNumberMatch = parsedComponents.address.match(/^(\d+)\s+/);
        const houseNumber = houseNumberMatch ? houseNumberMatch[1] : '';
        const streetName = parsedComponents.address.replace(/^\d+\s+/, '').trim();
        
        // Use parsed components, but fall back to Mapbox context if parsing failed
        const finalCity = parsedComponents.city || geocodedAddress.city;
        const finalState = parsedComponents.state || geocodedAddress.state;
        const finalZipCode = parsedComponents.zipCode || geocodedAddress.zipCode;
        
        return {
          houseNumber,
          street: streetName,
          city: finalCity,
          state: finalState,
          zipCode: finalZipCode,
        };
      } else {
        // Fallback to manual parsing if geocoding fails
        const { address, city, state, zipCode } = MapboxGeocodingService.extractAddressComponents(suggestion.place_name);
        
        // Extract house number from the address
        const houseNumberMatch = address.match(/^(\d+)\s+/);
        const houseNumber = houseNumberMatch ? houseNumberMatch[1] : '';
        const streetName = address.replace(/^\d+\s+/, '').trim();
        
        return {
          houseNumber,
          street: streetName,
          city,
          state,
          zipCode,
        };
      }
    } catch (error) {
      console.error('Error parsing smart search suggestion:', error);
      throw new Error('Failed to parse address suggestion');
    }
  }

  /**
   * Perform smart property search
   */
  static async performSearch(addressFields: SmartSearchAddress, coordinates: [number, number]): Promise<SmartSearchResult> {
    try {
      const fullAddress = `${addressFields.houseNumber} ${addressFields.street}, ${addressFields.city}, ${addressFields.state} ${addressFields.zipCode}`;
      
      const searchRequest = {
        address: fullAddress,
        searchType: 'smart' as const,
        latitude: coordinates[1],
        longitude: coordinates[0]
      };
      
      const result = await PropertySearchService.performSearch(searchRequest);
      
      if (result.success) {
        return {
          success: true,
          data: {
            address: result.data?.address || fullAddress,
            latitude: result.data?.latitude || coordinates[1],
            longitude: result.data?.longitude || coordinates[0],
            searchHistoryId: result.data?.searchHistoryId,
            enhancedData: result.data?.enhancedData
          }
        };
      }

      return {
        success: false,
        error: result.error || 'Smart search failed'
      };
    } catch (error) {
      console.error('Smart search service error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during smart search'
      };
    }
  }

  /**
   * Validate smart search input fields
   */
  static validateFields(addressFields: SmartSearchAddress): SmartSearchValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const fieldStatus: SmartSearchValidation['fieldStatus'] = {
      houseNumber: 'invalid',
      street: 'invalid',
      city: 'invalid',
      state: 'invalid',
      zipCode: 'invalid'
    };

    // House Number validation
    if (!addressFields.houseNumber.trim()) {
      errors.push('House number is required');
    } else if (!/^\d+$/.test(addressFields.houseNumber.trim())) {
      errors.push('House number must contain only digits');
      fieldStatus.houseNumber = 'invalid';
    } else {
      fieldStatus.houseNumber = 'valid';
    }

    // Street validation
    if (!addressFields.street.trim()) {
      errors.push('Street address is required');
    } else if (addressFields.street.trim().length < 3) {
      errors.push('Street address must be at least 3 characters');
      fieldStatus.street = 'invalid';
    } else {
      fieldStatus.street = 'valid';
    }

    // City validation
    if (!addressFields.city.trim()) {
      errors.push('City is required');
    } else if (addressFields.city.trim().length < 2) {
      errors.push('City must be at least 2 characters');
      fieldStatus.city = 'invalid';
    } else {
      fieldStatus.city = 'valid';
    }

    // State validation
    if (!addressFields.state.trim()) {
      errors.push('State is required');
    } else if (addressFields.state.trim().length !== 2) {
      errors.push('State must be a 2-letter abbreviation');
      fieldStatus.state = 'invalid';
    } else {
      fieldStatus.state = 'valid';
    }

    // ZIP Code validation
    if (!addressFields.zipCode.trim()) {
      errors.push('ZIP code is required');
    } else if (!/^\d{5}(-\d{4})?$/.test(addressFields.zipCode.trim())) {
      errors.push('ZIP code must be 5 digits or 5+4 format');
      fieldStatus.zipCode = 'invalid';
    } else {
      fieldStatus.zipCode = 'valid';
    }

    // Additional warnings
    if (addressFields.houseNumber.trim() && parseInt(addressFields.houseNumber) > 99999) {
      warnings.push('House number seems unusually high');
    }

    if (addressFields.state.trim() && !/^[A-Z]{2}$/.test(addressFields.state.trim().toUpperCase())) {
      warnings.push('State should be a 2-letter abbreviation (e.g., CA, NY)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fieldStatus
    };
  }

  /**
   * Check if smart search is available for an address
   */
  static async checkAvailability(addressFields: SmartSearchAddress): Promise<{
    available: boolean;
    reason?: string;
    estimatedCost?: number;
  }> {
    try {
      // This would typically call an external API to check availability
      // For now, we'll simulate the check
      const validation = this.validateFields(addressFields);
      
      if (!validation.isValid) {
        return {
          available: false,
          reason: 'Address fields are incomplete or invalid'
        };
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Random availability for demo purposes
      const available = Math.random() > 0.3;
      
      return {
        available,
        reason: available ? undefined : 'Smart search not available for this address',
        estimatedCost: available ? 1 : undefined
      };
    } catch (error) {
      console.error('Error checking smart search availability:', error);
      return {
        available: false,
        reason: 'Unable to check availability'
      };
    }
  }

  /**
   * Enhance suggestions with smart search specific metadata
   */
  private static enhanceSmartSuggestions(suggestions: any[]): SmartSearchSuggestion[] {
    return suggestions.map(suggestion => ({
      ...suggestion,
      confidence: Math.random() * 0.3 + 0.7, // Simulate confidence score
      relevance: Math.random() * 0.4 + 0.6, // Simulate relevance score
    }));
  }
}
