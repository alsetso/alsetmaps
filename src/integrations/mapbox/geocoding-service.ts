export interface AddressSuggestion {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [longitude, latitude]
  context: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
  properties: {
    address?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export interface GeocodedAddress {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
}

export class MapboxGeocodingService {
  private static accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  static async searchAddresses(query: string, limit: number = 5): Promise<AddressSuggestion[]> {
    if (!this.accessToken) {
      throw new Error('Mapbox access token not found');
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${this.accessToken}&types=address&limit=${limit}&country=US`
      );

      if (!response.ok) {
        throw new Error(`Geocoding request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.features || [];
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  static async geocodeAddress(address: string): Promise<GeocodedAddress | null> {
    if (!this.accessToken) {
      throw new Error('Mapbox access token not found');
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${this.accessToken}&types=address&limit=1&country=US`
      );

      if (!response.ok) {
        throw new Error(`Geocoding request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        return null;
      }

      const feature = data.features[0];
      const [longitude, latitude] = feature.center;
      
      // Extract address components from context
      const context = feature.context || [];
      const city = context.find(c => c.id.startsWith('place.'))?.text || '';
      const state = context.find(c => c.id.startsWith('region.'))?.text || '';
      const zipCode = context.find(c => c.id.startsWith('postcode.'))?.text || '';
      
      // Extract street address from properties or text
      const streetAddress = feature.properties?.address || feature.text || '';

      return {
        address: streetAddress,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        fullAddress: feature.place_name
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw error;
    }
  }

  static extractAddressComponents(placeName: string): {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  } {
    // Parse the place_name format: "123 Main St, City, State ZIP, Country"
    const parts = placeName.split(', ').map(part => part.trim());
    
    if (parts.length < 3) {
      return { address: '', city: '', state: '', zipCode: '' };
    }

    const address = parts[0];
    const city = parts[1];
    
    // Handle state and ZIP (they might be combined like "CA 90210")
    const stateZipPart = parts[2];
    const stateZipMatch = stateZipPart.match(/^([A-Z]{2})\s*(\d{5}(?:-\d{4})?)$/);
    
    if (stateZipMatch) {
      return {
        address,
        city,
        state: stateZipMatch[1],
        zipCode: stateZipMatch[2]
      };
    }

    // Fallback: just state
    return {
      address,
      city,
      state: stateZipPart,
      zipCode: ''
    };
  }
}
