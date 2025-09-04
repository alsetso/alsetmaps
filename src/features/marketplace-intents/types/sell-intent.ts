export type IntentType = 'fsbo' | 'agent' | 'wholesale';

export type PropertyType = 'single-family' | 'multi-family' | 'condo' | 'townhouse' | 'land' | 'commercial';

export type Timeline = 'asap' | '1-3months' | '3-6months' | '6-12months' | 'flexible';

export interface SellIntentData {
  // Pin-specific property information (no city-level matching)
  pinId: string;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  
  // Sell-specific information
  intentType: IntentType;
  agentName?: string;
  agentCompany?: string;
  agentPhone?: string;
  agentEmail?: string;
  
  // Property details
  propertyType: PropertyType;
  estimatedValue: string;
  desiredPrice: string;
  timeline: Timeline;
  
  // Contact information
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  
  // Additional information
  additionalNotes?: string;
  propertyCondition?: string;
  reasonForSelling?: string;
}

export interface IntentTypeOption {
  value: IntentType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export interface PropertyTypeOption {
  value: PropertyType;
  label: string;
}

export interface TimelineOption {
  value: Timeline;
  label: string;
}
