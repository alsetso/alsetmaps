import { Pin } from '../types/pin';

export interface PublicPin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  images?: string[];
  notes?: string;
  is_public: boolean;
  share_token?: string;
  view_count?: number;
  last_viewed_at?: string;
  seo_title?: string;
  seo_description?: string;
  share_settings?: any;
  created_at: string;
  updated_at?: string;
  // For sale listing fields
  is_for_sale?: boolean;
  listing_price?: number;
  property_type?: string;
  listing_description?: string;
  listing_status?: string;
  for_sale_by?: string;
  agent_name?: string;
  agent_company?: string;
  agent_phone?: string;
  agent_email?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: number;
  year_built?: number;
}

export interface PublicPinsResponse {
  success: boolean;
  pins?: PublicPin[];
  error?: string;
}

export class PublicPinsService {
  /**
   * Fetch all for-sale pins
   */
  static async getPublicPins(): Promise<PublicPinsResponse> {
    try {
      console.log('🔍 For-Sale Pins Service: Fetching for-sale pins...');
      
      const response = await fetch('/api/public/pins', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ For-Sale Pins Service: API error', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || 'Unknown error'
        });
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('✅ For-Sale Pins Service: Successfully fetched for-sale pins', {
        count: data.pins?.length || 0
      });

      return {
        success: true,
        pins: data.pins || []
      };

    } catch (error) {
      console.error('❌ For-Sale Pins Service: Unexpected error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Fetch a specific public pin by ID
   */
  static async getPublicPin(pinId: string): Promise<{ success: boolean; pin?: PublicPin; error?: string }> {
    try {
      console.log('🔍 Public Pins Service: Fetching public pin', { pinId });
      
      const response = await fetch(`/api/public/pins/${pinId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Public Pins Service: API error', {
          pinId,
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || 'Unknown error'
        });
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('✅ Public Pins Service: Successfully fetched public pin', { pinId });

      return {
        success: true,
        pin: data.pin
      };

    } catch (error) {
      console.error('❌ For-Sale Pins Service: Unexpected error', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
