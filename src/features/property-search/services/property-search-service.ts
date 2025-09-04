import { supabase } from '@/integrations/supabase/client';

export interface SearchRequest {
  address: string;
  searchType: 'basic' | 'smart';
  latitude?: number;
  longitude?: number;
}

export interface SearchResult {
  id: string;
  address: string;
  searchType: 'basic' | 'smart';
  latitude?: number;
  longitude?: number;
  searchHistoryId: string;
  creditsUsed: number;
  success: boolean;
  data?: any;
  error?: string;
}

export interface SearchHistoryRecord {
  id: string;
  user_id: string;
  search_address: string;
  search_type: 'basic' | 'smart';
  credits_used: number;
  created_at: string;
  smart_data?: any; // New field for storing Zillow API response
}

export class PropertySearchService {
  /**
   * Perform a complete property search (basic or smart)
   */
  static async performSearch(searchRequest: SearchRequest): Promise<SearchResult> {
    try {
      console.log('PropertySearchService.performSearch called with:', searchRequest);
      
      // 1. Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('User not authenticated');
      }

      // 2. Get user's account record
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      if (accountError || !account) {
        throw new Error('User account not found');
      }

      // 3. Check credits for smart search
      if (searchRequest.searchType === 'smart') {
        const { data: credits, error: creditsError } = await supabase
          .from('credits')
          .select('available_credits')
          .eq('user_id', account.id)
          .single();

        if (creditsError || !credits || credits.available_credits < 1) {
          throw new Error('Insufficient credits for smart search');
        }
      }

      // 4. Perform actual search based on type
      let searchData: any;
      let creditsUsed = 0;

      if (searchRequest.searchType === 'basic') {
        searchData = await this.performBasicSearch(searchRequest);
        creditsUsed = 0;
      } else {
        // For smart search, check if API call is successful before proceeding
        searchData = await this.performSmartSearch(searchRequest.address, searchRequest.latitude || 0, searchRequest.longitude || 0);
        
        // Check if the Zillow API call was successful BEFORE proceeding
        if (searchData.zillowData && searchData.zillowData.error) {
          throw new Error(`Zillow API failed: ${searchData.zillowData.error}`);
        }
        
        // Only set creditsUsed if the API call was successful
        creditsUsed = 1;
      }

      // 5. Only record search in history if the search was successful (no errors thrown above)
      const searchHistory = await this.recordSearchHistory(account.id, searchRequest, searchData);
      if (!searchHistory) {
        throw new Error('Failed to record search history');
      }

      // 6. Only deduct credits for successful smart searches
      if (searchRequest.searchType === 'smart' && creditsUsed > 0) {
        const deductionSuccess = await this.deductCredits(account.id, searchHistory.id, creditsUsed);
        if (!deductionSuccess) {
          console.error('Failed to deduct credits, but search was successful');
          // Don't throw error here as the search itself succeeded
        }
      }

      // 7. Return complete result
      return {
        id: Date.now().toString(),
        address: searchRequest.address,
        searchType: searchRequest.searchType,
        latitude: searchRequest.latitude,
        longitude: searchRequest.longitude,
        searchHistoryId: searchHistory.id,
        creditsUsed,
        success: true,
        data: searchData
      };

    } catch (error) {
      console.error('PropertySearchService.performSearch error:', error);
      return {
        id: Date.now().toString(),
        address: searchRequest.address,
        searchType: searchRequest.searchType,
        searchHistoryId: '',
        creditsUsed: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  /**
   * Record search in history using direct Supabase client
   */
  private static async recordSearchHistory(accountId: string, searchRequest: SearchRequest, searchData?: any): Promise<SearchHistoryRecord | null> {
    try {
      const historyData: any = {
        user_id: accountId,
        search_address: searchRequest.address,
        search_type: searchRequest.searchType,
        credits_used: searchRequest.searchType === 'smart' ? 1 : 0
      };

      // Add smart_data for smart searches
      if (searchRequest.searchType === 'smart' && searchData) {
        historyData.smart_data = searchData;
      }

      const { data, error } = await supabase
        .from('search_history')
        .insert([historyData])
        .select()
        .single();

      if (error) {
        console.error('Error recording search history:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error recording search history:', error);
      return null;
    }
  }

  /**
   * Perform basic property search
   */
  private static async performBasicSearch(searchRequest: SearchRequest): Promise<any> {
    // Basic search - return minimal property data
    return {
      type: 'basic',
      address: searchRequest.address,
      timestamp: new Date().toISOString(),
      message: 'Basic search completed - enhanced data available with smart search'
    };
  }

  /**
   * Perform smart property search using real Zillow API
   */
  private static async performSmartSearch(address: string, latitude: number, longitude: number): Promise<any> {
    try {
      console.log('Performing smart search for:', address);
      
      // Build the URL with the address as a query parameter
      const url = new URL('https://zillow56.p.rapidapi.com/search_address');
      url.searchParams.append('address', address);
      
      console.log('Calling Zillow API with URL:', url.toString());
      
      // Call the real Zillow API
      const zillowResponse = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'zillow56.p.rapidapi.com',
          'x-rapidapi-key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || 'f4a7d42741mshbc2b95a8fd24074p1cf1a6jsn44343abb32e8'
        }
      });

      if (!zillowResponse.ok) {
        throw new Error(`Zillow API error: ${zillowResponse.status} ${zillowResponse.statusText}`);
      }

      const zillowData = await zillowResponse.json();
      console.log('Zillow API response:', zillowData);

      // Check if the API returned an error
      if (zillowData.error) {
        throw new Error(`Zillow API returned error: ${zillowData.error}`);
      }

      // Return the real API data
      return {
        type: 'smart',
        address,
        timestamp: new Date().toISOString(),
        zillowData,
        message: 'Smart search completed with real Zillow data'
      };

    } catch (error) {
      console.error('Smart search error:', error);
      throw error;
    }
  }

  /**
   * Deduct credits for smart search - SIMPLIFIED VERSION
   */
  private static async deductCredits(accountId: string, searchId: string, amount: number): Promise<boolean> {
    try {
      // First, get current credit balance
      const { data: currentCredits, error: fetchError } = await supabase
        .from('credits')
        .select('available_credits')
        .eq('user_id', accountId)
        .single();

      if (fetchError || !currentCredits) {
        console.error('Error fetching current credits:', fetchError);
        return false;
      }

      // Check if user has enough credits
      if (currentCredits.available_credits < amount) {
        console.error('Insufficient credits:', currentCredits.available_credits, 'needed:', amount);
        return false;
      }

      // Calculate new balance
      const newBalance = currentCredits.available_credits - amount;

      // Update credits with new balance
      const { error: updateError } = await supabase
        .from('credits')
        .update({ available_credits: newBalance })
        .eq('user_id', accountId);

      if (updateError) {
        console.error('Error updating credits:', updateError);
        return false;
      }

      console.log(`Credits deducted successfully: ${amount} credits removed, new balance: ${newBalance}`);
      return true;

    } catch (error) {
      console.error('Error in deductCredits:', error);
      return false;
    }
  }

  /**
   * Get user's credit balance
   */
  static async getCreditBalance(): Promise<{ availableCredits: number } | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return null;

      const { data: account } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      if (!account) return null;

      const { data: credits, error } = await supabase
        .from('credits')
        .select('available_credits')
        .eq('user_id', account.id)
        .single();

      if (error || !credits) return null;

      return { availableCredits: credits.available_credits };
    } catch (error) {
      console.error('Error getting credit balance:', error);
      return null;
    }
  }

  /**
   * Get user's search history
   */
  static async getSearchHistory(limit: number = 20): Promise<SearchHistoryRecord[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return [];

      const { data: account } = await supabase
        .from('accounts')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      if (!account) return [];

      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', account.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return [];

      return data || [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }
}
