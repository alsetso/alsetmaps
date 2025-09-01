export interface SearchHistory {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  anonymous_id?: string | null;
  search_address: string;
  normalized_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  search_type: string;
  search_tier: 'basic' | 'smart';
  credits_consumed: number;
  search_filters: Record<string, any>;
  rapid_api_data?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  user_agent?: string | null;
  ip_address?: string | null;
}

export interface SearchHistoryCreate {
  user_id?: string | null;
  session_id?: string | null;
  anonymous_id?: string | null;
  search_address: string;
  normalized_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  search_type?: string;
  search_tier?: 'basic' | 'smart';
  credits_consumed?: number;
  search_filters?: Record<string, any>;
  rapid_api_data?: Record<string, any> | null;
  user_agent?: string | null;
  ip_address?: string | null;
}

export interface SearchHistoryUpdate {
  search_address?: string;
  normalized_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  search_type?: string;
  search_tier?: 'basic' | 'smart';
  credits_consumed?: number;
  search_filters?: Record<string, any>;
  rapid_api_data?: Record<string, any> | null;
}

export interface SearchHistorySummary {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  anonymous_id?: string | null;
  search_address: string;
  normalized_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  search_type: string;
  search_tier: 'basic' | 'smart';
  credits_consumed: number;
  search_filters: Record<string, any>;
  rapid_api_data?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  user_type: 'authenticated' | 'anonymous';
}

export type SearchHistoryFilters = {
  user_id?: string;
  session_id?: string;
  anonymous_id?: string;
  search_type?: string;
  search_tier?: 'basic' | 'smart';
  date_from?: string;
  date_to?: string;
  has_coordinates?: boolean;
  has_rapid_api_data?: boolean;
};

// New interface for all searches analytics
export interface AllSearches {
  id: string;
  search_history_id: string;
  search_address: string;
  normalized_address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  search_type: string;
  search_tier: 'basic' | 'smart';
  credits_consumed: number;
  search_filters: Record<string, any>;
  rapid_api_data?: Record<string, any> | null;
  user_type: 'authenticated' | 'anonymous';
  user_id?: string | null;
  session_id?: string | null;
  anonymous_id?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  search_success: boolean;
  error_message?: string | null;
  created_at: string;
}

// Search tier configuration
export interface SearchTierConfig {
  basic: {
    credits_required: 0;
    features: string[];
    description: string;
  };
  smart: {
    credits_required: 1;
    features: string[];
    description: string;
  };
}

export const SEARCH_TIER_CONFIG: SearchTierConfig = {
  basic: {
    credits_required: 0,
    features: ['Address geocoding', 'Basic property search', 'Map display'],
    description: 'Free basic property search with address geocoding'
  },
  smart: {
    credits_required: 1,
    features: ['Advanced property data', 'Market analysis', 'Property insights', 'RapidAPI integration'],
    description: 'Premium search with comprehensive property data and market insights'
  }
};
