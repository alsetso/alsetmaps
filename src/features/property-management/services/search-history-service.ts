import { supabase } from '@/integrations/supabase/client';
import { 
  SearchHistory, 
  SearchHistoryCreate, 
  SearchHistoryUpdate, 
  SearchHistorySummary,
  SearchHistoryFilters 
} from '../types';

export class SearchHistoryService {
  /**
   * Create a new search history record
   */
  static async create(data: SearchHistoryCreate): Promise<SearchHistory | null> {
    try {
      const { data: searchHistory, error } = await supabase
        .from('search_history')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('Error creating search history:', error);
        return null;
      }

      return searchHistory;
    } catch (error) {
      console.error('Error creating search history:', error);
      return null;
    }
  }

  /**
   * Get search history by user ID (for authenticated users)
   */
  static async getByUserId(userId: string, filters?: SearchHistoryFilters): Promise<SearchHistory[]> {
    try {
      let query = supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply additional filters
      if (filters?.search_type) {
        query = query.eq('search_type', filters.search_type);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters?.has_coordinates !== undefined) {
        if (filters.has_coordinates) {
          query = query.not('latitude', 'is', null);
        } else {
          query = query.is('latitude', null);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching search history by user ID:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching search history by user ID:', error);
      return [];
    }
  }

  /**
   * Get search history by session ID (for anonymous users)
   */
  static async getBySessionId(sessionId: string, filters?: SearchHistoryFilters): Promise<SearchHistory[]> {
    try {
      let query = supabase
        .from('search_history')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      // Apply additional filters
      if (filters?.search_type) {
        query = query.eq('search_type', filters.search_type);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching search history by session ID:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching search history by session ID:', error);
      return [];
    }
  }

  /**
   * Get search history by anonymous ID (for anonymous users)
   */
  static async getByAnonymousId(anonymousId: string, filters?: SearchHistoryFilters): Promise<SearchHistory[]> {
    try {
      let query = supabase
        .from('search_history')
        .select('*')
        .eq('anonymous_id', anonymousId)
        .order('created_at', { ascending: false });

      // Apply additional filters
      if (filters?.search_type) {
        query = query.eq('search_type', filters.search_type);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching search history by anonymous ID:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching search history by anonymous ID:', error);
      return [];
    }
  }

  /**
   * Get search history summary view
   */
  static async getSummary(filters?: SearchHistoryFilters): Promise<SearchHistorySummary[]> {
    try {
      let query = supabase
        .from('search_history_summary')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters?.session_id) {
        query = query.eq('session_id', filters.session_id);
      }
      if (filters?.anonymous_id) {
        query = query.eq('anonymous_id', filters.anonymous_id);
      }
      if (filters?.search_type) {
        query = query.eq('search_type', filters.search_type);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters?.has_coordinates !== undefined) {
        if (filters.has_coordinates) {
          query = query.not('latitude', 'is', null);
        } else {
          query = query.is('latitude', null);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching search history summary:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching search history summary:', error);
      return [];
    }
  }

  /**
   * Update search history record
   */
  static async update(id: string, updates: SearchHistoryUpdate): Promise<SearchHistory | null> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating search history:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating search history:', error);
      return null;
    }
  }

  /**
   * Delete search history record
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting search history:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting search history:', error);
      return false;
    }
  }

  /**
   * Get search statistics
   */
  static async getStats(userId?: string, sessionId?: string, anonymousId?: string) {
    try {
      let query = supabase
        .from('search_history')
        .select('*');

      // Apply user identification filters
      if (userId) {
        query = query.eq('user_id', userId);
      } else if (sessionId) {
        query = query.eq('session_id', sessionId);
      } else if (anonymousId) {
        query = query.eq('anonymous_id', anonymousId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching search statistics:', error);
        return null;
      }

      const searches = data || [];
      
      return {
        total_searches: searches.length,
        searches_with_coordinates: searches.filter((s: SearchHistory) => s.latitude && s.longitude).length,
        searches_without_coordinates: searches.filter((s: SearchHistory) => !s.latitude || !s.longitude).length,
        unique_addresses: new Set(searches.map((s: SearchHistory) => s.search_address)).size,
        recent_searches: searches.slice(0, 10),
        search_type_breakdown: searches.reduce((acc: Record<string, number>, search: SearchHistory) => {
          acc[search.search_type] = (acc[search.search_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      console.error('Error fetching search statistics:', error);
      return null;
    }
  }

  /**
   * Generate a unique anonymous ID for non-signed-in users
   */
  static generateAnonymousId(): string {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a session ID for anonymous users
   */
  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
