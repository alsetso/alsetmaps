import { supabase } from '@/integrations/supabase/client';
import { OptimizedCreditService, CreditActionType } from '@/features/credit-system/services/optimized-credit-service';

export interface PropertySearchParams {
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

export interface PropertySearchResult {
  success: boolean;
  data?: any;
  error?: string;
  searchId?: string;
  fromCache: boolean;
  cacheExpiresAt?: string;
  creditsConsumed: number;
}

export interface CachedPropertyData {
  id: string;
  propertyData: any;
  dataSource: string;
  cacheExpiresAt: string;
  lastAccessed: string;
  accessCount: number;
}

export class OptimizedPropertySearchService {
  private static readonly RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;
  private static readonly RAPIDAPI_HOST = 'zillow-com1.p.rapidapi.com';
  private static readonly CACHE_DURATION_HOURS = 24;
  private static readonly MAX_CACHE_AGE_DAYS = 7;
  private static readonly SEARCH_RADIUS_DEFAULT = 5;

  /**
   * Perform a smart property search with intelligent caching
   */
  static async performSmartSearch(
    searchParams: PropertySearchParams,
    userId: string
  ): Promise<PropertySearchResult> {
    try {
      // 1. Validate credits before proceeding
      const creditValidation = await OptimizedCreditService.canPerformAction(
        userId,
        'search_smart',
        1
      );

      if (!creditValidation.canProceed) {
        return {
          success: false,
          error: creditValidation.message,
          fromCache: false,
          creditsConsumed: 0
        };
      }

      // 2. Check cache first
      const cachedData = await this.getCachedPropertyData(searchParams.address);
      
      if (cachedData && !this.isCacheExpired(cachedData.cacheExpiresAt)) {
        // Cache hit - no credits consumed
        await this.updateCacheAccess(cachedData.id);
        
        return {
          success: true,
          data: cachedData.propertyData,
          fromCache: true,
          cacheExpiresAt: cachedData.cacheExpiresAt,
          creditsConsumed: 0
        };
      }

      // 3. Consume credits for API call
      const creditConsumption = await OptimizedCreditService.consumeCredits(
        userId,
        'search_smart',
        1,
        undefined,
        undefined,
        `Smart property search for: ${searchParams.address}`,
        { searchParams }
      );

      if (!creditConsumption.success) {
        return {
          success: false,
          error: creditConsumption.message,
          fromCache: false,
          creditsConsumed: 0
        };
      }

      // 4. Perform API search
      const apiResult = await this.searchPropertiesViaAPI(searchParams);
      
      if (!apiResult.success) {
        // API failed - refund credits
        await OptimizedCreditService.refundCredits(
          userId,
          creditConsumption.transactionId,
          `API search failed: ${apiResult.error}`
        );
        
        return {
          success: false,
          error: apiResult.error,
          fromCache: false,
          creditsConsumed: 0
        };
      }

      // 5. Cache the results
      const cacheId = await this.cachePropertyData(
        searchParams.address,
        searchParams.latitude,
        searchParams.longitude,
        apiResult.data
      );

      // 6. Record search in history
      const searchId = await this.recordSearch(
        userId,
        searchParams,
        'smart',
        cacheId
      );

      return {
        success: true,
        data: apiResult.data,
        searchId,
        fromCache: false,
        creditsConsumed: 1
      };

    } catch (error) {
      console.error('Smart search failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        fromCache: false,
        creditsConsumed: 0
      };
    }
  }

  /**
   * Get cached property data from database
   */
  private static async getCachedPropertyData(address: string): Promise<CachedPropertyData | null> {
    try {
      const { data, error } = await supabase.rpc('get_cached_property_data', {
        address_param: address,
        search_radius_miles: this.SEARCH_RADIUS_DEFAULT
      });

      if (error || !data || data.length === 0) {
        return null;
      }

      const result = data[0];
      if (!result.is_cached) {
        return null;
      }

      // Fetch full cache record
      const { data: cacheRecord, error: fetchError } = await supabase
        .from('property_data_cache')
        .select('*')
        .eq('id', result.cache_id)
        .single();

      if (fetchError || !cacheRecord) {
        return null;
      }

      return {
        id: cacheRecord.id,
        propertyData: cacheRecord.property_data,
        dataSource: cacheRecord.data_source,
        cacheExpiresAt: cacheRecord.cache_expires_at,
        lastAccessed: cacheRecord.last_accessed,
        accessCount: cacheRecord.access_count
      };
    } catch (error) {
      console.error('Error getting cached property data:', error);
      return null;
    }
  }

  /**
   * Check if cache is expired
   */
  private static isCacheExpired(expiresAt: string): boolean {
    return new Date(expiresAt) <= new Date();
  }

  /**
   * Update cache access statistics
   */
  private static async updateCacheAccess(cacheId: string): Promise<void> {
    try {
      await supabase
        .from('property_data_cache')
        .update({
          last_accessed: new Date().toISOString(),
          access_count: supabase.sql`access_count + 1`
        })
        .eq('id', cacheId);
    } catch (error) {
      console.error('Error updating cache access:', error);
    }
  }

  /**
   * Cache property data in database
   */
  private static async cachePropertyData(
    address: string,
    latitude?: number,
    longitude?: number,
    propertyData: any
  ): Promise<string> {
    try {
      const addressHash = this.generateAddressHash(address);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.CACHE_DURATION_HOURS);

      const { data, error } = await supabase
        .from('property_data_cache')
        .upsert({
          address_hash: addressHash,
          normalized_address: address,
          latitude,
          longitude,
          property_data: propertyData,
          data_source: 'rapidapi_zillow',
          cache_expires_at: expiresAt.toISOString(),
          last_accessed: new Date().toISOString(),
          access_count: 1
        }, {
          onConflict: 'address_hash'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error caching property data:', error);
        return '';
      }

      return data?.id || '';
    } catch (error) {
      console.error('Error caching property data:', error);
      return '';
    }
  }

  /**
   * Generate consistent address hash for caching
   */
  private static generateAddressHash(address: string): string {
    // Simple hash for demo - in production, use crypto.createHash
    return btoa(address.toLowerCase().trim()).replace(/[^a-zA-Z0-9]/g, '').substring(0, 64);
  }

  /**
   * Search properties via RapidAPI
   */
  private static async searchPropertiesViaAPI(searchParams: PropertySearchParams): Promise<PropertySearchResult> {
    if (!this.RAPIDAPI_KEY) {
      return {
        success: false,
        error: 'RapidAPI key not configured',
        fromCache: false,
        creditsConsumed: 0
      };
    }

    try {
      const url = new URL('https://zillow-com1.p.rapidapi.com/propertyExtendedSearch');
      const params = new URLSearchParams();
      
      // Build query parameters
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
        data: processedData,
        fromCache: false,
        creditsConsumed: 0
      };
    } catch (error) {
      console.error('RapidAPI search failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'RapidAPI search failed',
        fromCache: false,
        creditsConsumed: 0
      };
    }
  }

  /**
   * Process and format property data from RapidAPI
   */
  private static processPropertyData(rawData: any): any {
    try {
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
          dataSource: 'Zillow',
          cacheStrategy: 'intelligent_caching'
        }
      };
    } catch (error) {
      console.error('Error processing property data:', error);
      return rawData;
    }
  }

  /**
   * Record search in search history
   */
  private static async recordSearch(
    userId: string,
    searchParams: PropertySearchParams,
    searchTier: 'basic' | 'smart',
    propertyCacheId?: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .insert({
          user_id: userId,
          search_address: searchParams.address,
          normalized_address: searchParams.address,
          latitude: searchParams.latitude,
          longitude: searchParams.longitude,
          search_type: 'property_search',
          search_tier: searchTier,
          search_filters: searchParams,
          search_metadata: {
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error recording search:', error);
        return '';
      }

      // If we have property data, link it to search results
      if (propertyCacheId && data?.id) {
        await this.linkSearchToPropertyData(data.id, propertyCacheId);
      }

      return data?.id || '';
    } catch (error) {
      console.error('Error recording search:', error);
      return '';
    }
  }

  /**
   * Link search to property data in search_results table
   */
  private static async linkSearchToPropertyData(
    searchId: string,
    propertyCacheId: string
  ): Promise<void> {
    try {
      await supabase
        .from('search_results')
        .insert({
          search_id: searchId,
          property_cache_id: propertyCacheId,
          result_rank: 1,
          relevance_score: 1.0
        });
    } catch (error) {
      console.error('Error linking search to property data:', error);
    }
  }

  /**
   * Clean up expired cache entries
   */
  static async cleanupExpiredCache(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('property_data_cache')
        .delete()
        .lt('cache_expires_at', new Date().toISOString())
        .select('id');

      if (error) {
        console.error('Error cleaning up expired cache:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Error cleaning up expired cache:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    totalCachedProperties: number;
    cacheHitRate: number;
    averageCacheAge: number;
    mostAccessedProperties: number;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('property_data_cache')
        .select('created_at, last_accessed, access_count');

      if (error) {
        console.error('Error getting cache stats:', error);
        return null;
      }

      const now = new Date();
      const totalCached = data.length;
      
      if (totalCached === 0) {
        return {
          totalCachedProperties: 0,
          cacheHitRate: 0,
          averageCacheAge: 0,
          mostAccessedProperties: 0
        };
      }

      const totalAccesses = data.reduce((sum, item) => sum + (item.access_count || 0), 0);
      const cacheHitRate = totalAccesses / totalCached;
      
      const averageAge = data.reduce((sum, item) => {
        const age = now.getTime() - new Date(item.created_at).getTime();
        return sum + age;
      }, 0) / totalCached;

      const mostAccessed = Math.max(...data.map(item => item.access_count || 0));

      return {
        totalCachedProperties: totalCached,
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        averageCacheAge: Math.round(averageAge / (1000 * 60 * 60 * 24) * 100) / 100, // in days
        mostAccessedProperties: mostAccessed
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }
}
