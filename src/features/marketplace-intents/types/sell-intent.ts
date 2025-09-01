export type IntentType = 'fsbo' | 'agent' | 'wholesale';

export type PropertyType = 'single-family' | 'multi-family' | 'condo' | 'townhouse' | 'land' | 'commercial';

export type Timeline = 'asap' | '1-3months' | '3-6months' | '6-12months' | 'flexible';

export interface SellIntentData {
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  intentType: IntentType;
  propertyType: PropertyType;
  estimatedValue: string;
  desiredPrice: string;
  timeline: Timeline;
  agentName?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  additionalNotes?: string;
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
