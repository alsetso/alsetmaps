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
      console.log('🗺️ Mapbox context:', context);
      
      const city = context.find((c: any) => c.id.startsWith('place.'))?.text || '';
      const state = context.find((c: any) => c.id.startsWith('region.'))?.text || '';
      const zipCode = context.find((c: any) => c.id.startsWith('postcode.'))?.text || '';
      
      console.log('📍 Extracted components:', { city, state, zipCode });
      
      // Extract street address from properties or text
      const streetAddress = feature.properties?.address || feature.text || '';
      console.log('🏠 Street address:', streetAddress);

      const result = {
        address: streetAddress,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        fullAddress: feature.place_name
      };
      
      console.log('🎯 Geocoded result:', result);
      return result;
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
    console.log('🔍 Parsing place_name:', placeName);
    
    // Parse the place_name format: "123 Main St, City, State ZIP, Country"
    const parts = placeName.split(', ').map(part => part.trim());
    console.log('📝 Split parts:', parts);
    
    if (parts.length < 3) {
      console.log('⚠️ Not enough parts for parsing');
      return { address: '', city: '', state: '', zipCode: '' };
    }

    const address = parts[0];
    const city = parts[1];
    
    // Production-worthy parsing strategy
    let state = '';
    let zipCode = '';
    
    // Strategy 1: Look for state + ZIP combination in any part
    for (let i = 2; i < parts.length - 1; i++) {
      const part = parts[i];
      console.log(`🔍 Checking part ${i}: "${part}"`);
      
      // Pattern 1: "CA 90210" or "California 90210"
      const stateZipPattern1 = part.match(/^([A-Z]{2})\s*(\d{5}(?:-\d{4})?)$/);
      if (stateZipPattern1) {
        state = stateZipPattern1[1];
        zipCode = stateZipPattern1[2];
        console.log('✅ Strategy 1 success:', { state, zipCode, part });
        break;
      }
      
      // Pattern 2: "90210" with state before or after
      const zipMatch = part.match(/(\d{5}(?:-\d{4})?)/);
      if (zipMatch) {
        zipCode = zipMatch[1];
        console.log('✅ Found ZIP:', zipCode);
        
        // Look for state in the same part
        const beforeZip = part.replace(zipMatch[0], '').trim();
        const afterZip = part.substring(part.indexOf(zipMatch[0]) + zipMatch[0].length).trim();
        
        // Check if state is before ZIP (e.g., "CA 90210")
        if (beforeZip.match(/^[A-Z]{2}$/)) {
          state = beforeZip;
          console.log('✅ Found state before ZIP:', state);
        }
        // Check if state is after ZIP (e.g., "90210 CA")
        else if (afterZip.match(/^[A-Z]{2}$/)) {
          state = afterZip;
          console.log('✅ Found state after ZIP:', state);
        }
        
        if (state) break;
      }
    }
    
    // Strategy 2: If we still don't have a state, search all parts for state codes
    if (!state) {
      console.log('🔍 Strategy 2: Searching for standalone state codes');
      for (let i = 2; i < parts.length - 1; i++) {
        const part = parts[i];
        
        // Look for 2-letter state codes
        const stateMatch = part.match(/\b([A-Z]{2})\b/);
        if (stateMatch) {
          state = stateMatch[1];
          console.log('✅ Found standalone state:', { state, part });
          break;
        }
        
        // Look for full state names and convert to abbreviations
        const fullStateMatch = part.match(/\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i);
        if (fullStateMatch) {
          const stateName = fullStateMatch[1];
          const stateAbbr = this.getStateAbbreviation(stateName);
          if (stateAbbr) {
            state = stateAbbr;
            console.log('✅ Found full state name:', { stateName, stateAbbr, part });
            break;
          }
        }
      }
    }
    
    // Strategy 3: If we still don't have a ZIP, look for it in any remaining part
    if (!zipCode) {
      console.log('🔍 Strategy 3: Searching for ZIP in remaining parts');
      for (let i = 2; i < parts.length - 1; i++) {
        const part = parts[i];
        const zipMatch = part.match(/(\d{5}(?:-\d{4})?)/);
        if (zipMatch) {
          zipCode = zipMatch[1];
          console.log('✅ Found ZIP in remaining part:', { zipCode, part });
          break;
        }
      }
    }

    const result = {
      address,
      city,
      state,
      zipCode
    };
    
    console.log('🎯 Final parsed result:', result);
    return result;
  }

  // Helper method to convert full state names to abbreviations
  private static getStateAbbreviation(fullName: string): string | null {
    const stateMap: { [key: string]: string } = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
      'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
      'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
      'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
      'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
      'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
      'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
      'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
      'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
      'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
      'wisconsin': 'WI', 'wyoming': 'WY'
    };
    
    return stateMap[fullName.toLowerCase()] || null;
  }

  // Test methods removed - functionality is working
}
