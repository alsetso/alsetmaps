import { supabase } from '@/integrations/supabase/client';
import { ZillowService } from '@/integrations/rapidapi/zillow-service';

export interface PropertyData {
  id: string;
  address_hash: string;
  normalized_address: string;
  latitude: number;
  longitude: number;
  zillow_data: any;
  zillow_last_updated: string;
  zillow_data_fresh: boolean;
  total_searches: number;
  last_searched_at: string;
  total_pins: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyDataParams {
  address: string;
  latitude: number;
  longitude: number;
  zillow_data?: any;
}

export class PropertyDataService {
  // Check if property data exists in cache
  static async getPropertyData(address: string): Promise<PropertyData | null> {
    console.log('🔍 [PropertyDataService] Checking property data cache for:', address);
    
    const addressHash = await this.generateAddressHash(address);
    console.log('🔐 [PropertyDataService] Generated address hash:', addressHash);
    
    const { data, error } = await supabase
      .from('property_data')
      .select('*')
      .eq('address_hash', addressHash)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ [PropertyDataService] Database error:', error);
      throw new Error(`Failed to fetch property data: ${error.message}`);
    }

    if (data) {
      console.log('✅ [PropertyDataService] Found cached property data:', {
        id: data.id,
        address_hash: data.address_hash,
        has_zillow_data: Object.keys(data.zillow_data).length > 0,
        last_updated: data.zillow_last_updated,
        total_searches: data.total_searches,
        total_pins: data.total_pins
      });
    } else {
      console.log('❌ [PropertyDataService] No cached property data found');
    }

    return data;
  }

  // Get or create property data (without calling Zillow API)
  static async getOrCreatePropertyData(params: CreatePropertyDataParams): Promise<PropertyData> {
    console.log('🏗️ [PropertyDataService] Getting or creating property data for:', params.address);
    
    const addressHash = await this.generateAddressHash(params.address);
    console.log('🔐 [PropertyDataService] Address hash:', addressHash);
    
    let propertyData = await this.getPropertyData(params.address);
    
    if (!propertyData) {
      console.log('🆕 [PropertyDataService] Creating new property data record...');
      
      // Create new property data record
      const { data, error } = await supabase
        .from('property_data')
        .insert({
          address_hash: addressHash,
          normalized_address: await this.normalizeAddress(params.address),
          latitude: params.latitude,
          longitude: params.longitude,
          zillow_data: params.zillow_data || {},
          total_searches: 1,
          last_searched_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [PropertyDataService] Failed to create property data:', error);
        throw new Error(`Failed to create property data: ${error.message}`);
      }
      
      propertyData = data;
      console.log('✅ [PropertyDataService] New property data created:', {
        id: propertyData.id,
        address_hash: propertyData.address_hash,
        coordinates: [propertyData.latitude, propertyData.longitude]
      });
    } else {
      console.log('✅ [PropertyDataService] Using existing property data');
    }

    return propertyData;
  }

  // Fetch fresh Zillow data and update cache
  static async fetchAndCacheZillowData(address: string): Promise<any> {
    console.log('🌐 [PropertyDataService] Fetching fresh Zillow data for:', address);
    
    try {
      // Fetch fresh data from Zillow
      const zillowData = await ZillowService.searchByAddress(address);
      console.log('✅ [PropertyDataService] Zillow API call successful, data received');
      
      // Update or create property data cache
      const addressHash = await this.generateAddressHash(address);
      
      const { data: existingProperty } = await supabase
        .from('property_data')
        .select('id')
        .eq('address_hash', addressHash)
        .single();

      if (existingProperty) {
        console.log('🔄 [PropertyDataService] Updating existing property data cache...');
        
        // Update existing property data
        await supabase
          .from('property_data')
          .update({
            zillow_data: zillowData.raw_data || {},
            zillow_last_updated: new Date().toISOString(),
            zillow_data_fresh: true
          })
          .eq('id', existingProperty.id);
          
        console.log('✅ [PropertyDataService] Property data cache updated successfully');
      } else {
        console.warn('⚠️ [PropertyDataService] Property data not found when updating Zillow data');
      }

      return zillowData;
    } catch (error) {
      console.error('❌ [PropertyDataService] Failed to fetch and cache Zillow data:', error);
      throw error;
    }
  }

  // Check if cached data is fresh (within 24 hours)
  static isDataFresh(lastUpdated: string): boolean {
    const lastUpdate = new Date(lastUpdated);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    const isFresh = hoursDiff < 24;
    
    console.log('⏰ [PropertyDataService] Data freshness check:', {
      lastUpdated,
      hoursDiff: hoursDiff.toFixed(2),
      isFresh
    });
    
    return isFresh;
  }

  // Get property data with fresh Zillow data if needed
  static async getPropertyDataWithZillow(address: string, forceRefresh: boolean = false): Promise<{
    propertyData: PropertyData;
    zillowData: any;
    wasCached: boolean;
  }> {
    console.log('🎯 [PropertyDataService] Getting property data with Zillow for:', address);
    console.log('🔄 [PropertyDataService] Force refresh:', forceRefresh);
    
    // First, check cache
    let propertyData = await this.getPropertyData(address);
    
    if (!propertyData) {
      console.log('🆕 [PropertyDataService] Property not in cache, creating new record...');
      
      // Property doesn't exist - create it and fetch Zillow data
      const newPropertyData = await this.getOrCreatePropertyData({
        address,
        latitude: 0, // You'll need to get these from geocoding
        longitude: 0
      });
      
      console.log('🌐 [PropertyDataService] Fetching fresh Zillow data for new property...');
      
      // Fetch fresh Zillow data
      const zillowData = await this.fetchAndCacheZillowData(address);
      
      console.log('✅ [PropertyDataService] New property created with fresh Zillow data');
      
      return {
        propertyData: newPropertyData,
        zillowData: zillowData.raw_data,
        wasCached: false
      };
    }

    // Check if we need fresh Zillow data
    const needsRefresh = forceRefresh || 
                       !propertyData.zillow_data_fresh || 
                       !this.isDataFresh(propertyData.zillow_last_updated) ||
                       Object.keys(propertyData.zillow_data).length === 0;

    console.log('🔍 [PropertyDataService] Cache refresh analysis:', {
      forceRefresh,
      dataFresh: propertyData.zillow_data_fresh,
      timeFresh: this.isDataFresh(propertyData.zillow_last_updated),
      hasData: Object.keys(propertyData.zillow_data).length > 0,
      needsRefresh
    });

    if (needsRefresh) {
      console.log('🔄 [PropertyDataService] Cache needs refresh, fetching fresh Zillow data...');
      
      // Fetch fresh Zillow data
      const zillowData = await this.fetchAndCacheZillowData(address);
      
      console.log('✅ [PropertyDataService] Fresh Zillow data fetched and cached');
      
      return {
        propertyData,
        zillowData: zillowData.raw_data,
        wasCached: false
      };
    } else {
      console.log('✅ [PropertyDataService] Using cached Zillow data');
      
      // Use cached data
      return {
        propertyData,
        zillowData: propertyData.zillow_data,
        wasCached: true
      };
    }
  }

  // Increment search count for a property
  static async incrementSearchCount(address: string): Promise<void> {
    console.log('🔢 [PropertyDataService] Incrementing search count for:', address);
    
    const addressHash = await this.generateAddressHash(address);
    
    const { error } = await supabase
      .from('property_data')
      .update({ 
        total_searches: (propertyData?.total_searches || 0) + 1,
        last_searched_at: new Date().toISOString()
      })
      .eq('address_hash', addressHash);

    if (error) {
      console.error('❌ [PropertyDataService] Failed to increment search count:', error);
      throw new Error(`Failed to increment search count: ${error.message}`);
    }
    
    console.log('✅ [PropertyDataService] Search count incremented successfully');
  }

  // Increment pin count for a property
  static async incrementPinCount(address: string): Promise<void> {
    console.log('📍 [PropertyDataService] Incrementing pin count for:', address);
    
    const addressHash = await this.generateAddressHash(address);
    
    // First get current property data to increment pin count
    const currentProperty = await this.getPropertyData(address);
    const currentPinCount = currentProperty?.total_pins || 0;
    
    const { error } = await supabase
      .from('property_data')
      .update({ 
        total_pins: currentPinCount + 1,
        updated_at: new Date().toISOString()
      })
      .eq('address_hash', addressHash);

    if (error) {
      console.error('❌ [PropertyDataService] Failed to increment pin count:', error);
      throw new Error(`Failed to increment pin count: ${error.message}`);
    }
    
    console.log('✅ [PropertyDataService] Pin count incremented successfully');
  }

  // Get popular properties (most searched)
  static async getPopularProperties(limit: number = 10): Promise<PropertyData[]> {
    const { data, error } = await supabase
      .from('property_data')
      .select('*')
      .order('total_searches', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch popular properties: ${error.message}`);
    return data || [];
  }

  // Get properties with recent Zillow data
  static async getPropertiesWithRecentZillowData(limit: number = 20): Promise<PropertyData[]> {
    const { data, error } = await supabase
      .from('property_data')
      .select('*')
      .not('zillow_data', 'eq', '{}')
      .order('zillow_last_updated', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch properties with recent Zillow data: ${error.message}`);
    return data || [];
  }

  // Helper function to generate address hash
  private static async generateAddressHash(address: string): Promise<string> {
    const { data, error } = await supabase.rpc('generate_address_hash', { input_address: address });
    if (error) throw new Error(`Failed to generate address hash: ${error.message}`);
    return data;
  }

  // Helper function to normalize address
  private static async normalizeAddress(address: string): Promise<string> {
    const { data, error } = await supabase.rpc('normalize_address', { input_address: address });
    if (error) throw new Error(`Failed to normalize address: ${error.message}`);
    return data;
  }
}
