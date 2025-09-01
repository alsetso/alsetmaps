export type FindAgentStatus = 'new' | 'processing' | 'matched' | 'completed' | 'cancelled';

export interface FindAgentRequest {
  id: string;
  
  // Personal Information
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  
  // Location Preferences
  state: string;
  city?: string;
  
  // Property Information
  property_type?: string;
  timeline?: string;
  
  // Budget Information
  min_budget?: number;
  max_budget?: number;
  
  // Additional Details
  additional_info?: string;
  
  // Request Status
  status: FindAgentStatus;
  
  // Agent Matching
  matched_agents: string[];
  assigned_agent_id?: string;
  
  // User Information (if authenticated)
  user_id?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  processed_at?: string;
  completed_at?: string;
}

export interface CreateFindAgentRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  state: string;
  city?: string;
  property_type?: string;
  timeline?: string;
  min_budget?: number;
  max_budget?: number;
  additional_info?: string;
  user_id?: string;
}

export interface UpdateFindAgentRequest {
  id: string;
  status?: FindAgentStatus;
  matched_agents?: string[];
  assigned_agent_id?: string;
  processed_at?: string;
  completed_at?: string;
}

export interface FindAgentFilters {
  status?: FindAgentStatus;
  state?: string;
  city?: string;
  property_type?: string;
  timeline?: string;
  user_id?: string;
  assigned_agent_id?: string;
  created_after?: string;
  created_before?: string;
  limit?: number;
  offset?: number;
}

export interface FindAgentStats {
  total_requests: number;
  new_requests: number;
  processing_requests: number;
  matched_requests: number;
  completed_requests: number;
  cancelled_requests: number;
  average_response_time_hours: number;
}

// Form validation schema
export const findAgentFormSchema = {
  first_name: { required: true, minLength: 1, maxLength: 50 },
  last_name: { required: true, minLength: 1, maxLength: 50 },
  email: { required: true, type: 'email', maxLength: 100 },
  phone: { required: true, minLength: 10, maxLength: 20 },
  state: { required: true, minLength: 2, maxLength: 2 },
  city: { required: false, maxLength: 100 },
  property_type: { required: false, maxLength: 100 },
  timeline: { required: false, maxLength: 50 },
  min_budget: { required: false, type: 'number', min: 0 },
  max_budget: { required: false, type: 'number', min: 0 },
  additional_info: { required: false, maxLength: 1000 }
};

// Property type options (matching the form)
export const PROPERTY_TYPES = [
  'Single Family Home',
  'Condo/Townhouse',
  'Multi-Family',
  'Commercial',
  'Land',
  'Investment Property',
  'Luxury Home',
  'New Construction'
] as const;

export type PropertyType = typeof PROPERTY_TYPES[number];

// Timeline options (matching the form)
export const TIMELINE_OPTIONS = [
  'Immediately',
  '1-3 months',
  '3-6 months',
  '6-12 months',
  'Just exploring'
] as const;

export type TimelineOption = typeof TIMELINE_OPTIONS[number];

// State options (matching the form)
export const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const;

export type State = typeof STATES[number];
