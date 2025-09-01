import { supabase } from '@/integrations/supabase/client';
import { Pin, CreatePinData, PinFilterOptions, PinType } from '../types/pin';

export class PinsService {
  // Create a new pin with enhanced functionality
  static async createPin(pinData: CreatePinData): Promise<Pin> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get account ID for the user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      throw new Error('Account not found');
    }

    // Prepare pin data with defaults
    const pinInsertData = {
      account_id: account.id,
      input_address: pinData.input_address,
      latitude: pinData.latitude,
      longitude: pinData.longitude,
      pin_type: pinData.pin_type,
      visibility: pinData.visibility,
      title: pinData.title || this.generateDefaultTitle(pinData.pin_type, pinData.input_address),
      description: pinData.description,
      tags: pinData.tags || [],
      linked_resources: [],
      
      // Type-specific data
      intent_data: pinData.intent_data || {},
      market_analysis: pinData.market_analysis || {},
      
      // Contact preferences
      contact_preferences: pinData.contact_preferences || {},
      
      // Status and verification
      status: 'active' as PinStatus,
      is_verified: false,
      
      // Expiration and activity
      expires_at: pinData.expires_at || this.calculateDefaultExpiration(pinData.pin_type),
      last_activity_at: new Date().toISOString()
    };

    // Create the pin
    const { data, error } = await supabase
      .from('pins')
      .insert(pinInsertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create pin: ${error.message}`);
    }

    console.log('✅ [PinsService] Pin created successfully:', {
      id: data.id,
      type: data.pin_type,
      visibility: data.visibility,
      address: data.input_address
    });

    return data;
  }

  // Get user's pins with filtering
  static async getUserPins(filterOptions?: Partial<PinFilterOptions>): Promise<Pin[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get account ID for the user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      throw new Error('Account not found');
    }

    let query = supabase
      .from('pins')
      .select('*')
      .eq('account_id', account.id);

    // Apply filters
    if (filterOptions?.pin_type) {
      query = query.eq('pin_type', filterOptions.pin_type);
    }

    if (filterOptions?.status) {
      query = query.eq('status', filterOptions.status);
    }

    if (filterOptions?.visibility) {
      query = query.eq('visibility', filterOptions.visibility);
    }

    if (filterOptions?.verified_only) {
      query = query.eq('is_verified', true);
    }

    if (filterOptions?.tags && filterOptions.tags.length > 0) {
      query = query.overlaps('tags', filterOptions.tags);
    }

    if (filterOptions?.location) {
      // Simple radius search - in production, you'd want to use PostGIS for better performance
      const { latitude, longitude, radius } = filterOptions.location;
      // This is a simplified approach - consider using PostGIS ST_DWithin for production
      query = query.filter('latitude', 'gte', latitude - radius/111)
                   .filter('latitude', 'lte', latitude + radius/111)
                   .filter('longitude', 'gte', longitude - radius/111)
                   .filter('longitude', 'lte', longitude + radius/111);
    }

    if (filterOptions?.date_range) {
      query = query.gte('created_at', filterOptions.date_range.start.toISOString())
                   .lte('created_at', filterOptions.date_range.end.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user pins: ${error.message}`);
    }

    return data || [];
  }

  // Get pins by type and visibility
  static async getPinsByType(pinType: PinType, visibility: string): Promise<Pin[]> {
    const { data, error } = await supabase
      .from('pins')
      .select('*')
      .eq('pin_type', pinType)
      .eq('visibility', visibility)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch ${pinType} pins: ${error.message}`);
    }

    return data || [];
  }

  // Get buyer intent pins
  static async getBuyerIntentPins(): Promise<Pin[]> {
    return this.getPinsByType('buyer_intent', 'public');
  }

  // Get seller listing pins
  static async getSellerListingPins(): Promise<Pin[]> {
    return this.getPinsByType('seller_listing', 'public');
  }

  // Get market analysis pins
  static async getMarketAnalysisPins(): Promise<Pin[]> {
    return this.getPinsByType('market_analysis', 'public');
  }

  // Update pin
  static async updatePin(pinId: string, updates: Partial<Pin>): Promise<Pin> {
    const { data, error } = await supabase
      .from('pins')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', pinId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update pin: ${error.message}`);
    }

    return data;
  }

  // Delete pin
  static async deletePin(pinId: string): Promise<void> {
    const { error } = await supabase
      .from('pins')
      .delete()
      .eq('id', pinId);

    if (error) {
      throw new Error(`Failed to delete pin: ${error.message}`);
    }
  }

  // Get pin by ID
  static async getPinById(pinId: string): Promise<Pin | null> {
    const { data, error } = await supabase
      .from('pins')
      .select('*')
      .eq('id', pinId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Pin not found
      }
      throw new Error(`Failed to fetch pin: ${error.message}`);
    }

    return data;
  }

  // Search pins by address
  static async searchPinsByAddress(address: string): Promise<Pin[]> {
    const { data, error } = await supabase
      .from('pins')
      .select('*')
      .ilike('input_address', `%${address}%`)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search pins: ${error.message}`);
    }

    return data || [];
  }

  // Get nearby pins
  static async getNearbyPins(latitude: number, longitude: number, radiusKm: number = 5): Promise<Pin[]> {
    // Convert km to approximate degrees (1 degree ≈ 111 km)
    const radiusDegrees = radiusKm / 111;

    const { data, error } = await supabase
      .from('pins')
      .select('*')
      .gte('latitude', latitude - radiusDegrees)
      .lte('latitude', latitude + radiusDegrees)
      .gte('longitude', longitude - radiusDegrees)
      .lte('longitude', longitude + radiusDegrees)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch nearby pins: ${error.message}`);
    }

    return data || [];
  }

  // Helper methods
  private static generateDefaultTitle(pinType: PinType, address: string): string {
    const shortAddress = address.split(',')[0];
    
    switch(pinType) {
      case 'buyer_intent':
        return `Looking to Buy: ${shortAddress}`;
      case 'seller_listing':
        return `Property for Sale: ${shortAddress}`;
      case 'market_analysis':
        return `Market Analysis: ${shortAddress}`;
      default:
        return `Pin: ${shortAddress}`;
    }
  }

  private static calculateDefaultExpiration(pinType: PinType): string {
    const now = new Date();
    
    switch(pinType) {
      case 'buyer_intent':
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days
      case 'seller_listing':
        return new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(); // 180 days
      case 'market_analysis':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
      default:
        return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days
    }
  }
}
