export type AgentStatus = 'active' | 'pending' | 'suspended' | 'inactive';
export type VerificationMethod = 'license_check' | 'manual_review' | 'client_reference';

export type InquiryType = 'general' | 'property_viewing' | 'listing_help' | 'market_analysis' | 'other';
export type InquiryStatus = 'new' | 'contacted' | 'in_progress' | 'completed' | 'spam';


export interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name?: string;
  license_number?: string;
  license_state?: string;
  
  // Professional details
  specialties: string[];
  service_areas: string[];
  years_experience?: number;
  languages: string[];
  
  // Contact and social
  website?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  
  // Profile content
  bio?: string;
  profile_image?: string;
  cover_image?: string;
  
  // Verification and status
  is_verified: boolean;
  verification_date?: string;
  verification_method?: VerificationMethod;
  status: AgentStatus;
  
  // Owner and review management
  owner_id?: string;
  reviewed_by?: string;
  
  // SEO and discovery
  slug: string;
  search_keywords: string[];
  featured: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_activity_at: string;
}



export interface AgentInquiry {
  id: string;
  agent_id: string;
  
  // Inquirer information
  inquirer_name: string;
  inquirer_email: string;
  inquirer_phone?: string;
  
  // Inquiry details
  inquiry_type: InquiryType;
  subject: string;
  message: string;
  
  // Property context (if applicable)
  property_address?: string;
  property_type?: string;
  
  // Status tracking
  status: InquiryStatus;
  assigned_to?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  responded_at?: string;
}

export interface AgentSearchFilters {
  search_query?: string;
  location_filter?: string[];
  specialty_filter?: string[];
  limit_count?: number;
  offset_count?: number;
}

export interface AgentSearchResult {
  id: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  slug: string;
  profile_image?: string;
  specialties: string[];
  service_areas: string[];
  is_verified: boolean;
  featured: boolean;
  search_score: number;
}

export interface CreateAgentData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name?: string;
  license_number?: string;
  license_state?: string;
  specialties: string[];
  service_areas: string[];
  years_experience?: number;
  languages?: string[];
  website?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  bio?: string;
  profile_image?: string;
  cover_image?: string;
  search_keywords?: string[];
}

export interface UpdateAgentData extends Partial<CreateAgentData> {
  id: string;
}



export interface CreateInquiryData {
  agent_id: string;
  inquirer_name: string;
  inquirer_email: string;
  inquirer_phone?: string;
  inquiry_type: InquiryType;
  subject: string;
  message: string;
  property_address?: string;
  property_type?: string;
}

export interface AgentStats {
  total_agents: number;
  verified_agents: number;
  featured_agents: number;
  total_inquiries: number;
}
