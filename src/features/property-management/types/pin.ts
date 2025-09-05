// Enhanced Pin Types for the new architecture
export type PinType = 'buyer_intent' | 'seller_listing' | 'market_analysis';
export type PinStatus = 'active' | 'pending' | 'sold' | 'expired' | 'verified' | 'unverified';
export type PinVisibility = 'public' | 'private' | 'buyers_only' | 'sellers_only';

// Base Pin interface
export interface Pin {
  id: string;
  account_id: string;
  input_address: string;
  latitude: number;
  longitude: number;
  pin_type: PinType;
  status: PinStatus;
  visibility: PinVisibility;
  
  // Buyer/Seller intent specific fields
  intent_data?: IntentData;
  
  // Market analysis specific fields
  market_analysis?: MarketAnalysisData;
  
  // Pin metadata
  title?: string;
  description?: string;
  tags?: string[];
  linked_resources?: string[]; // IDs of other tables/resources
  
  // Legacy fields for backward compatibility
  name: string;
  notes?: string;
  images?: string[];
  user_id: string;
  search_history_id?: string;
  
  // Sharing and visibility
  is_public?: boolean;
  share_token?: string;
  seo_title?: string;
  seo_description?: string;
  custom_domain?: string;
  share_settings?: any;
  
  // Terms agreement
  requires_terms_agreement?: boolean;
  custom_terms?: string;
  terms_agreement_count?: number;
  
  // For sale listing
  listing_price?: number;
  property_type?: string;
  timeline?: string;
  for_sale_by?: string;
  contact_info?: any;
  agent_name?: string;
  agent_company?: string;
  agent_phone?: string;
  agent_email?: string;
  listing_status?: string;
  
  // Analytics
  view_count?: number;
  last_viewed_at?: string;
  
  // Contact and matching
  contact_preferences?: ContactPreferences;
  match_score?: number;
  
  // Verification and moderation
  is_verified?: boolean;
  verified_at?: string;
  verified_by?: string;
  
  // Expiration and lifecycle
  expires_at?: string;
  last_activity_at?: string;
  
  created_at: string;
  updated_at: string;
}

// Intent Data for Buyer/Seller pins
export interface IntentData {
  buyer_intent_id?: string;
  seller_intent_id?: string;
  wholesale_intent_id?: string;
  
  // Intent-specific data
  intent_details?: {
    price_range?: [number, number];
    property_types?: string[];
    locations?: string[];
    timeline?: string;
    financing_type?: string;
    down_payment?: number;
    credit_score?: number;
    additional_requirements?: string;
  };
  
  // Contact preferences
  contact_method?: 'email' | 'phone' | 'both';
  preferred_contact_time?: string;
  urgency_level?: 'low' | 'medium' | 'high' | 'urgent';
  
  // Matching preferences
  match_criteria?: {
    max_distance?: number;
    property_condition?: string[];
    neighborhood_preferences?: string[];
    school_district_importance?: boolean;
    commute_time_preference?: number;
  };
}

// Market Analysis Data
export interface MarketAnalysisData {
  analysis_type: 'comparable_sales' | 'rental_analysis' | 'investment_analysis' | 'market_trends';
  analysis_date: string;
  data_sources: string[];
  key_findings: string[];
  recommendations: string[];
  confidence_score: number;
  market_indicators: {
    days_on_market: number;
    price_per_sqft: number;
    inventory_level: string;
    market_direction: 'rising' | 'stable' | 'declining';
  };
}

// Contact Preferences
export interface ContactPreferences {
  preferred_method: 'email' | 'phone' | 'in_person';
  availability: string[];
  response_time: 'immediate' | 'same_day' | 'next_day' | 'week';
  language_preference?: string;
  timezone?: string;
}

// Create Pin Data (for creating new pins)
export interface CreatePinData {
  input_address: string;
  latitude: number;
  longitude: number;
  pin_type: PinType;
  visibility: PinVisibility;
  title?: string;
  description?: string;
  tags?: string[];
  linked_resources?: string[];
  
  // Type-specific data
  intent_data?: Partial<IntentData>;
  market_analysis?: Partial<MarketAnalysisData>;
  
  // Contact preferences
  contact_preferences?: Partial<ContactPreferences>;
  
  // Expiration
  expires_at?: string;
}

// Pin Filter Options
export interface PinFilterOptions {
  pin_type?: PinType;
  status?: PinStatus;
  visibility?: PinVisibility;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  tags?: string[];
  date_range?: {
    start: Date;
    end: Date;
  };
  verified_only?: boolean;
}

// Pin Search Results
export interface PinSearchResult {
  pins: Pin[];
  total_count: number;
  has_more: boolean;
  filters_applied: PinFilterOptions;
}

// Legacy interfaces for backward compatibility
export interface LegacyPropertyData {
  zillow_id?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: number;
  year_built?: number;
  property_type?: string;
  listing_status?: string;
  last_sold_date?: string;
  last_sold_price?: number;
  zestimate?: number;
  rent_zestimate?: number;
  raw_data?: any; // Raw Zillow API response
}

export interface ZillowSearchResult {
  address: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  lot_size?: number;
  year_built?: number;
  property_type?: string;
  listing_status?: string;
  last_sold_date?: string;
  last_sold_price?: number;
  zestimate?: number;
  rent_zestimate?: number;
  raw_data: any;
}
